import { useState, useEffect, useRef } from "react";
import {
  Header,
  ResearchStatus,
  ResearchReport,
  ResearchForm,
  ResearchQueries,
  CurationExtraction,
  ResearchBriefings
} from './components';
import CompanySelector from './components/CompanySelector';
import type { ResearchOutput, ResearchStatusType } from './types';
import { glassStyle, fadeInAnimation } from './styles';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Company {
  id: string;
  name: string;
  url?: string;
  hq?: string;
  industry?: string;
}

function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isResearching, setIsResearching] = useState(false);
  const [status, setStatus] = useState<ResearchStatusType | null>(null);
  const [output, setOutput] = useState<ResearchOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [originalCompanyName, setOriginalCompanyName] = useState<string>("");
  const [currentPhase, setCurrentPhase] = useState<'search' | 'enrichment' | 'briefing' | 'complete' | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const [queries, setQueries] = useState<Array<{ text: string; number: number; category: string }>>([]);
  const [streamingQueries, setStreamingQueries] = useState<Record<string, { text: string; number: number; category: string; isComplete: boolean }>>({});
  const [isQueriesExpanded, setIsQueriesExpanded] = useState(true);
  const [enrichmentCounts, setEnrichmentCounts] = useState<{
    company: { total: number; enriched: number };
    industry: { total: number; enriched: number };
    financial: { total: number; enriched: number };
    news: { total: number; enriched: number };
  } | undefined>(undefined);
  const [briefingStatus, setBriefingStatus] = useState({
    company: false,
    industry: false,
    financial: false,
    news: false
  });
  const [isEnrichmentExpanded, setIsEnrichmentExpanded] = useState(true);
  const [isBriefingExpanded, setIsBriefingExpanded] = useState(true);
  const [hasScrolledToStatus, setHasScrolledToStatus] = useState(false);
  const [isReportStreaming, setIsReportStreaming] = useState(false);

  // Add new state for color cycling
  const [loaderColor, setLoaderColor] = useState("#6366f1");
  
  // Scroll helper function
  const scrollToStatus = () => {
    if (!hasScrolledToStatus && statusRef.current) {
      const yOffset = -20;
      const y = statusRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setHasScrolledToStatus(true);
    }
  };

  // Load companies from localStorage on mount
  useEffect(() => {
    const savedCompanies = localStorage.getItem('companies');
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }
  }, []);

  // Save companies to localStorage whenever they change
  useEffect(() => {
    if (companies.length > 0) {
      localStorage.setItem('companies', JSON.stringify(companies));
    }
  }, [companies]);

  // Add useEffect for color cycling
  useEffect(() => {
    if (!isResearching) return;
    
    const colors = [
      "#6366f1", // Indigo
      "#8b5cf6", // Purple
      "#ec4899", // Pink
      "#f59e0b", // Amber
      "#10b981", // Emerald
      "#3b82f6", // Blue
    ];
    
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % colors.length;
      setLoaderColor(colors[currentIndex]);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isResearching]);

  const handleAddCompany = (company: Omit<Company, 'id'>) => {
    const newCompany: Company = {
      ...company,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setCompanies([...companies, newCompany]);
  };

  const handleRemoveCompany = (id: string) => {
    setCompanies(companies.filter(c => c.id !== id));
    if (selectedCompany?.id === id) {
      setSelectedCompany(null);
    }
  };

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    // Auto-fill form with selected company
    if (formRef.current) {
      const form = formRef.current.querySelector('form');
      if (form) {
        const nameInput = form.querySelector('[name="companyName"]') as HTMLInputElement;
        const urlInput = form.querySelector('[name="companyUrl"]') as HTMLInputElement;
        const hqInput = form.querySelector('[name="companyHq"]') as HTMLInputElement;
        const industryInput = form.querySelector('[name="companyIndustry"]') as HTMLInputElement;
        
        if (nameInput) nameInput.value = company.name;
        if (urlInput) urlInput.value = company.url || '';
        if (hqInput) hqInput.value = company.hq || '';
        if (industryInput) industryInput.value = company.industry || 'Construction';
      }
    }
  };

  const formRef = useRef<HTMLDivElement>(null);

  const resetResearch = () => {
    setIsResetting(true);
    
    // Use setTimeout to create a smooth transition
    setTimeout(() => {
      setStatus(null);
      setOutput(null);
      setError(null);
      setIsComplete(false);
      setCurrentPhase(null);
      setQueries([]);
      setStreamingQueries({});
      setEnrichmentCounts(undefined);
      setBriefingStatus({
        company: false,
        industry: false,
        financial: false,
        news: false
      });
      setIsQueriesExpanded(true);
      setIsEnrichmentExpanded(true);
      setIsBriefingExpanded(true);
      setHasScrolledToStatus(false);
      setIsReportStreaming(false);
      setIsResetting(false);
    }, 300);
  };

  // Stream research results via SSE
  const streamResults = (jobId: string) => {
    const eventSource = new EventSource(`${API_URL}/research/${jobId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Helper function to map node names to user-friendly step names
        const getStepName = (nodeName: string): string => {
          const stepMap: Record<string, string> = {
            'grounding': 'Search',
            'financial_analyst': 'Search',
            'news_scanner': 'Search',
            'industry_analyst': 'Search',
            'company_analyst': 'Search',
            'collector': 'Search',
            'curator': 'Enriching',
            'enricher': 'Enriching',
            'briefing': 'Briefing',
            'editor': 'Finalizing'
          };
          return stepMap[nodeName] || nodeName;
        };

        // Handle progress events from backend (node transitions)
        if (data.type === 'progress' && data.step) {
          const stepName = getStepName(data.step);
          setStatus({
            step: stepName,
            message: `Processing ${data.step}...`
          });
          
          // Update phase based on step
          if (['grounding', 'financial_analyst', 'news_scanner', 'industry_analyst', 'company_analyst', 'collector'].includes(data.step)) {
            setCurrentPhase('search');
          } else if (['curator', 'enricher'].includes(data.step)) {
            setCurrentPhase('enrichment');
          } else if (data.step === 'briefing') {
            setCurrentPhase('briefing');
          }
          
          scrollToStatus();
        }
        
        // Direct event-to-phase mapping
        if (data.type === 'query_generating') {
          // Show query being generated and update streaming queries
          setCurrentPhase('search');
          setStatus({
            step: 'Search',
            message: `Query ${data.query_number}: ${data.query}`
          });
          // Update streaming queries with current partial query
          const key = `${data.category}_${data.query_number}`;
          setStreamingQueries(prev => ({
            ...prev,
            [key]: {
              text: data.query,
              number: data.query_number,
              category: data.category,
              isComplete: false
            }
          }));
        } else if (data.type === 'query_generated') {
          // Show completed query and move to queries list
          setCurrentPhase('search');
          setStatus({
            step: 'Search',
            message: `Generated: ${data.query}`
          });
          // Add to completed queries
          setQueries(prev => [...prev, {
            text: data.query,
            number: data.query_number,
            category: data.category
          }]);
          // Remove from streaming queries
          const key = `${data.category}_${data.query_number}`;
          setStreamingQueries(prev => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
          });
          scrollToStatus();
        } else if (data.type === 'research_init') {
          // Show research initialization
          setCurrentPhase('search');
          setStatus({
            step: 'Initializing',
            message: data.message || `Initiating research for ${data.company}`
          });
        } else if (data.type === 'crawl_start') {
          // Show website crawl starting
          setCurrentPhase('search');
          setStatus({
            step: 'Website Crawl',
            message: data.message || 'Crawling company website'
          });
        } else if (data.type === 'curation') {
          // Show curation progress - transition to enrichment phase
          setCurrentPhase('enrichment');
          setStatus({
            step: 'Curating data',
            message: data.message || `Curating ${data.category} documents`
          });
          // Initialize enrichment counts when curation starts for a category
          if (data.category) {
            setEnrichmentCounts(prev => ({
              ...prev,
              [data.category]: {
                total: data.total || 0,
                enriched: 0
              }
            } as typeof enrichmentCounts));
          }
          // Collapse queries section when moving to enrichment
          setTimeout(() => {
            setIsQueriesExpanded(false);
          }, 1000);
          scrollToStatus();
        } else if (data.type === 'enrichment') {
          // Show enrichment progress
          setCurrentPhase('enrichment');
          setStatus({
            step: 'Enriching',
            message: data.message || 'Enriching documents with additional content'
          });
          // Update enriched count if provided
          if (data.category && data.enriched !== undefined) {
            const category = data.category as 'company' | 'industry' | 'financial' | 'news';
            setEnrichmentCounts(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                [category]: {
                  total: prev[category]?.total || data.total || 0,
                  enriched: data.enriched
                }
              } as typeof enrichmentCounts;
            });
          }
        } else if (data.type === 'briefing_start') {
          // Show briefing generation starting
          setCurrentPhase('briefing');
          setStatus({
            step: 'Generating briefings',
            message: `Creating ${data.category} briefing from ${data.total_docs} documents`
          });
          // Collapse enrichment section when moving to briefing
          setTimeout(() => {
            setIsEnrichmentExpanded(false);
          }, 1000);
          scrollToStatus();
        } else if (data.type === 'briefing_complete') {
          // Show briefing completion and mark category as complete
          setCurrentPhase('briefing');
          setStatus({
            step: 'Briefing complete',
            message: `${data.category} briefing generated (${data.content_length} characters)`
          });
          // Mark briefing as complete for this category
          if (data.category) {
            setBriefingStatus(prev => {
              const newBriefingStatus = {
                ...prev,
                [data.category]: true
              };
              
              // Check if all briefings are complete
              const allBriefingsComplete = Object.values(newBriefingStatus).every(status => status);
              
              // Collapse briefing section when all briefings are complete
              if (allBriefingsComplete) {
                setTimeout(() => {
                  setIsBriefingExpanded(false);
                }, 2000);
              }
              
              return newBriefingStatus;
            });
          }
        } else if (data.type === 'report_compilation') {
          // Show report compilation
          setCurrentPhase('briefing');
          setStatus({
            step: 'Finalizing report',
            message: data.message || 'Compiling final report'
          });
        } else if (data.type === 'report_chunk' && data.chunk) {
          // Stream report chunks as they arrive
          setIsReportStreaming(true);
          setOutput((prev) => {
            const currentReport = prev?.details?.report || '';
            return {
              summary: "",
              details: { report: currentReport + data.chunk },
            };
          });
          setStatus({
            step: 'Finalizing report',
            message: 'Generating final report...'
          });
        } else if (data.type === 'complete' && data.report) {
          setIsReportStreaming(false);
          setOutput({
            summary: "",
            details: { report: data.report },
          });
          setStatus({ step: "Complete", message: "Research completed successfully" });
          setIsComplete(true);
          setIsResearching(false);
          eventSource.close();
        } else if (data.type === 'error') {
          setError(data.error);
          setIsResearching(false);
          eventSource.close();
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = () => {
      setError('Connection lost or server error');
      setIsResearching(false);
      eventSource.close();
    };
  };

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Create a custom handler for the form that receives form data
  const handleFormSubmit = async (formData: {
    companyName: string;
    companyUrl: string;
    companyHq: string;
    companyIndustry: string;
  }) => {

    // Clear any existing errors first
    setError(null);

    // If research is complete, reset the UI first
    if (isComplete) {
      resetResearch();
      await new Promise(resolve => setTimeout(resolve, 300)); // Wait for reset animation
    }

    // Clear any existing SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsResearching(true);
    setOriginalCompanyName(formData.companyName);
    setStatus({
      step: "Processing",
      message: "Starting research..."
    });

    try {
      const url = `${API_URL}/research`;

      // Format the company URL if provided
      const formattedCompanyUrl = formData.companyUrl
        ? formData.companyUrl.startsWith('http://') || formData.companyUrl.startsWith('https://')
          ? formData.companyUrl
          : `https://${formData.companyUrl}`
        : undefined;

      const requestData = {
        company: formData.companyName,
        company_url: formattedCompanyUrl,
        industry: formData.companyIndustry || undefined,
        hq_location: formData.companyHq || undefined,
      };

      const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.job_id) {
        streamResults(data.job_id);
      } else {
        throw new Error("No job ID received");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start research");
      setIsResearching(false);
    }
  };

  // Add new function to handle PDF generation
  const handleGeneratePdf = async () => {
    if (!output || isGeneratingPdf) return;
    
    setIsGeneratingPdf(true);
    try {
      const response = await fetch(`${API_URL}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          report_content: output.details.report,
          company_name: originalCompanyName || output.details.report
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `${originalCompanyName || 'research_report'}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Add new function to handle copying to clipboard
  const handleCopyToClipboard = async () => {
    if (!output?.details?.report) return;
    
    try {
      await navigator.clipboard.writeText(output.details.report);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setError('Failed to copy to clipboard');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Component */}
        <Header glassStyle={glassStyle.card} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Company Selector */}
          <div className="lg:col-span-1">
            <CompanySelector
              companies={companies}
              selectedCompany={selectedCompany}
              onSelectCompany={handleSelectCompany}
              onAddCompany={handleAddCompany}
              onRemoveCompany={handleRemoveCompany}
            />
          </div>

          {/* Right Column - Research Form and Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Form Section */}
            <div ref={formRef}>
              <ResearchForm 
                onSubmit={handleFormSubmit}
                isResearching={isResearching}
                glassStyle={glassStyle}
                loaderColor={loaderColor}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className={`${glassStyle.card} border-red-200 bg-red-50 ${fadeInAnimation.fadeIn} ${isResetting ? 'opacity-0 transform -translate-y-4' : 'opacity-100 transform translate-y-0'}`}
              >
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Status Box */}
            <ResearchStatus
              status={status}
              error={error}
              isComplete={isComplete}
              currentPhase={currentPhase}
              isResetting={isResetting}
              glassStyle={glassStyle}
              loaderColor={loaderColor}
              statusRef={statusRef}
            />

            {/* Research Report - always at the top when available */}
            {output && output.details && (
              <ResearchReport
                output={{
                  summary: output.summary,
                  details: {
                    report: output.details.report || ''
                  }
                }}
                isResetting={isResetting}
                isStreaming={isReportStreaming}
                glassStyle={glassStyle}
                fadeInAnimation={fadeInAnimation}
                loaderColor={loaderColor}
                isGeneratingPdf={isGeneratingPdf}
                isCopied={isCopied}
                onCopyToClipboard={handleCopyToClipboard}
                onGeneratePdf={handleGeneratePdf}
              />
            )}

            {/* Research Briefings - show once briefing starts and keep visible */}
            {(currentPhase === 'briefing' || currentPhase === 'complete') && (
              <ResearchBriefings
                briefingStatus={briefingStatus}
                isExpanded={isBriefingExpanded}
                onToggleExpand={() => setIsBriefingExpanded(!isBriefingExpanded)}
                isResetting={isResetting}
              />
            )}

            {/* Curation and Extraction - show once enrichment starts and keep visible */}
            {(currentPhase === 'enrichment' || currentPhase === 'briefing' || currentPhase === 'complete') && enrichmentCounts && (
              <CurationExtraction
                enrichmentCounts={enrichmentCounts}
                isExpanded={isEnrichmentExpanded}
                onToggleExpand={() => setIsEnrichmentExpanded(!isEnrichmentExpanded)}
                isResetting={isResetting}
                loaderColor={loaderColor}
              />
            )}

            {/* Research Queries - always at the bottom when visible */}
            {(queries.length > 0 || Object.keys(streamingQueries).length > 0) && (
              <ResearchQueries
                queries={queries}
                streamingQueries={streamingQueries}
                isExpanded={isQueriesExpanded}
                onToggleExpand={() => setIsQueriesExpanded(!isQueriesExpanded)}
                isResetting={isResetting}
                glassStyle={glassStyle.card}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;