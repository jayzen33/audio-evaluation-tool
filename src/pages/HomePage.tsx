import { Logo } from '../components/Logo';
import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size={80} className="shadow-xl shadow-indigo-200 rounded-2xl" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            Audio Evaluation Tools
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A web-based tool for comparing audio model outputs side-by-side with content diff and quality evaluation.
          </p>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 items-stretch">
          {/* Comparison Tool Card */}
          <Link 
            to="/compare/default"
            className="group flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 h-full"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Comparison
                </h2>
                <p className="text-sm text-slate-500">Tag individual variants</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6 flex-grow">
              Compare multiple audio variants side-by-side. Tag each variant as good, maybe, or bad with detailed content diff.
            </p>
            <div className="flex items-center text-indigo-600 font-medium mt-auto">
              Get Started
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* AB Test Card */}
          <Link 
            to="/abtest/default"
            className="group flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-300 h-full"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                  AB Test
                </h2>
                <p className="text-sm text-slate-500">Choose the best option</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6 flex-grow">
              Blind or labeled AB testing. Listen to variants and select your preferred option. Supports blind mode for unbiased evaluation.
            </p>
            <div className="flex items-center text-emerald-600 font-medium mt-auto">
              Get Started
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* MOS Card */}
          <Link 
            to="/mos/default"
            className="group flex flex-col bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 h-full"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  MOS Scoring
                </h2>
                <p className="text-sm text-slate-500">Rate audio quality 1-5</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6 flex-grow">
              Mean Opinion Score evaluation. Rate each audio sample on a 1-5 scale (Bad to Excellent) with standardized quality criteria.
            </p>
            <div className="flex items-center text-blue-600 font-medium mt-auto">
              Get Started
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick Access Section */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Available Experiments</h3>
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Comparison
              </h4>
              <div className="flex flex-wrap gap-2">
                <Link to="/compare/default" className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 rounded-lg text-sm transition-colors">
                  default
                </Link>
                <Link to="/compare/exp1" className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 rounded-lg text-sm transition-colors">
                  exp1
                </Link>
                <Link to="/compare/exp2" className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 rounded-lg text-sm transition-colors">
                  exp2
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                AB Test
              </h4>
              <div className="flex flex-wrap gap-2">
                <Link to="/abtest/default" className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 rounded-lg text-sm transition-colors">
                  default
                </Link>
                <Link to="/abtest/exp1" className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 rounded-lg text-sm transition-colors">
                  exp1
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                MOS
              </h4>
              <div className="flex flex-wrap gap-2">
                <Link to="/mos/default" className="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-sm transition-colors">
                  default
                </Link>
                <Link to="/mos/exp1" className="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-sm transition-colors">
                  exp1
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* URL Patterns */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p className="mb-3">URL Patterns:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <code className="bg-slate-200 px-3 py-1.5 rounded text-slate-700">/compare/:expName</code>
            <code className="bg-slate-200 px-3 py-1.5 rounded text-slate-700">/abtest/:expName</code>
            <code className="bg-slate-200 px-3 py-1.5 rounded text-slate-700">/mos/:expName</code>
          </div>
        </div>
      </div>
    </div>
  );
}
