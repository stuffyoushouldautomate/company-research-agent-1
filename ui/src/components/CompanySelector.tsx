import { useState, useMemo } from 'react';
import { Search, Plus, X, Building2 } from 'lucide-react';
import { glassStyle } from '../styles';

interface Company {
  id: string;
  name: string;
  url?: string;
  hq?: string;
  industry?: string;
}

interface CompanySelectorProps {
  companies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
  onAddCompany: (company: Omit<Company, 'id'>) => void;
  onRemoveCompany: (id: string) => void;
}

const CONSTRUCTION_COMPANIES: Omit<Company, 'id'>[] = [
  { name: "ValveTek Utility Services, Inc." },
  { name: "MeterTek Utility Services Inc." },
  { name: "Esposito Construction LLC" },
  { name: "Esposito Construction" },
  { name: "E Control Services LLC" },
  { name: "Level 10 Development LLC" },
  { name: "Kyle Conti Construction" },
  { name: "Arold Construction Co. Inc." },
  { name: "J. Mullen & Sons, Inc." },
  { name: "Harrington and Sons Inc." },
  { name: "Rosario Contracting Corporation" },
  { name: "William J. Guarini Inc." },
  { name: "Old Bridge Township Recycling Program" },
  { name: "Soil Masters LLC" },
  { name: "Tom Krutis Excavating, Inc." },
  { name: "Boyce Excavating Co., Inc." },
  { name: "Think Pavers Hardscaping LLC" },
  { name: "AP and Sons Construction LLC" },
  { name: "A.P. Design & Construction LLC" },
  { name: "Stilo Excavation, Inc." },
  { name: "Stilo Paving & Excavating" },
  { name: "McKeon's Mobile Concrete, LLC" },
  { name: "Ward Pavements Inc." },
  { name: "Pro-Site Work-Paving Solutions" },
  { name: "Pro Site Work" },
  { name: "Paving Solutions" },
  { name: "D & L Paving Contractors, Inc." },
  { name: "Insituform Technologies LLC" },
  { name: "En-Tech Infrastructure LLC" },
  { name: "Azuria Water Solutions" },
  { name: "Hydrovac Excavating, Inc." },
  { name: "Precision Pipeline Solutions, LLC (PPS)" },
  { name: "A-TECH LANDSCAPE DESIGN INC." },
  { name: "A-Tech Landscape Design Inc." },
  { name: "A-Tech Services" },
  { name: "NJG OUTDOOR MANAGEMENT LLC" },
  { name: "Whispering Pines Developers LLC" },
  { name: "J.A. Neary Excavating" },
  { name: "Nearyco Inc." },
  { name: "J.A. Neary Excavating Corp." },
  { name: "Roy Rock" },
  { name: "Joe Maggio LLC" },
  { name: "Cioffi Excavating Services" },
  { name: "GMP Contracting, LLC" },
  { name: "Caravella Demolition, Inc." },
  { name: "Royce Demolition and Development" },
  { name: "Sullivan Construction Group, LLC" },
  { name: "HOER EXCAVATION & CONSTRUCTION COMPANY INCORPORATED" },
  { name: "SOCO Construction" },
];

const CompanySelector = ({
  companies,
  selectedCompany,
  onSelectCompany,
  onAddCompany,
  onRemoveCompany,
}: CompanySelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompany, setNewCompany] = useState<Omit<Company, 'id'>>({
    name: '',
    url: '',
    hq: '',
    industry: 'Construction',
  });

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const query = searchQuery.toLowerCase();
    return companies.filter(company =>
      company.name.toLowerCase().includes(query) ||
      company.hq?.toLowerCase().includes(query) ||
      company.industry?.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  const handleAddCompany = () => {
    if (newCompany.name.trim()) {
      onAddCompany(newCompany);
      setNewCompany({ name: '', url: '', hq: '', industry: 'Construction' });
      setShowAddForm(false);
      setSearchQuery('');
    }
  };

  const initializeCompanies = () => {
    CONSTRUCTION_COMPANIES.forEach(company => {
      if (!companies.find(c => c.name === company.name)) {
        onAddCompany(company);
      }
    });
  };

  return (
    <div className={`${glassStyle.card} space-y-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-gray-700" />
          <h2 className="text-2xl font-semibold text-gray-900">Companies</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {companies.length}
          </span>
        </div>
        <div className="flex gap-2">
          {companies.length === 0 && (
            <button
              onClick={initializeCompanies}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
            >
              Load Construction Companies
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors duration-200 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Add Company Form */}
      {showAddForm && (
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Company</h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewCompany({ name: '', url: '', hq: '', industry: 'Construction' });
              }}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                className={`${glassStyle.input} bg-white`}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="text"
                value={newCompany.url}
                onChange={(e) => setNewCompany({ ...newCompany, url: e.target.value })}
                className={`${glassStyle.input} bg-white`}
                placeholder="example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headquarters
              </label>
              <input
                type="text"
                value={newCompany.hq}
                onChange={(e) => setNewCompany({ ...newCompany, hq: e.target.value })}
                className={`${glassStyle.input} bg-white`}
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={newCompany.industry}
                onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                className={`${glassStyle.input} bg-white`}
                placeholder="Construction"
              />
            </div>
          </div>
          <button
            onClick={handleAddCompany}
            disabled={!newCompany.name.trim()}
            className="w-full px-4 py-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Company
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${glassStyle.input} bg-white pl-12`}
          placeholder="Search companies..."
        />
      </div>

      {/* Company List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No companies found</p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company.id}
              onClick={() => onSelectCompany(company)}
              className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                selectedCompany?.id === company.id
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${
                    selectedCompany?.id === company.id ? 'text-white' : 'text-gray-900'
                  }`}>
                    {company.name}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {company.hq && (
                      <span className={`${
                        selectedCompany?.id === company.id ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        📍 {company.hq}
                      </span>
                    )}
                    {company.industry && (
                      <span className={`${
                        selectedCompany?.id === company.id ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        🏗️ {company.industry}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCompany(company.id);
                  }}
                  className={`ml-3 p-1.5 rounded-lg transition-colors ${
                    selectedCompany?.id === company.id
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-400'
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompanySelector;

