import React from 'react';

const Header = ({ activeView, setActiveView }) => {
  const tabs = ['idea', 'outline', 'deck'];

  return (
    <header className="flex justify-center p-4 bg-black/20 border-b border-white/10">
      <div className="flex space-x-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveView(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeView === tab
                ? 'bg-peachSoft text-gray-800'
                : 'text-white/70 hover:bg-white/10'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </header>
  );
};

export default Header;