import { Github, Search } from 'lucide-react';

interface HeaderProps {
  glassStyle: string;
}

const Header = ({ glassStyle }: HeaderProps) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className="relative mb-12">
      <div className="text-center pt-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gray-900 rounded-2xl">
            <Search className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-5xl font-semibold text-gray-900 tracking-tight">
            Company Research
          </h1>
        </div>
        <p className="text-gray-600 text-base font-normal mt-2">
          Labor union company research for construction industry
        </p>
      </div>
      <div className="absolute top-0 right-0 flex items-center gap-2">
        <a
          href="https://tavily.com"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-gray-600 hover:text-gray-900 transition-colors ${glassStyle} rounded-xl flex items-center justify-center hover:bg-gray-50`}
          style={{ width: '44px', height: '44px', padding: '2px' }}
          aria-label="Tavily Website"
        >
          <img 
            src="/tavilylogo.png" 
            alt="Tavily Logo" 
            className="w-full h-full object-contain" 
            style={{ 
              width: '40px', 
              height: '40px',
              display: 'block',
              margin: 'auto'
            }}
            onError={handleImageError}
          />
        </a>
        <a
          href="https://github.com/guy-hartstein/company-research-agent"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-gray-600 hover:text-gray-900 transition-colors ${glassStyle} rounded-xl flex items-center justify-center hover:bg-gray-50`}
          style={{ width: '44px', height: '44px', padding: '10px' }}
          aria-label="GitHub Profile"
        >
          <Github 
            style={{ 
              width: '24px', 
              height: '24px',
              display: 'block',
              margin: 'auto'
            }} 
          />
        </a>
      </div>
    </div>
  );
};

export default Header; 