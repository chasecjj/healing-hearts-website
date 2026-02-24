import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import {
  BookOpen,
  Video,
  FileText,
  MessageSquare,
  LogOut,
  PlayCircle,
  CheckCircle2,
  ChevronDown,
  Lock
} from 'lucide-react';

const CoursePortal = () => {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  const [activeModule, setActiveModule] = useState(1);
  const [activeLesson, setActiveLesson] = useState(1);

  const modules = [
    {
      id: 1,
      title: "Module 1: Love's Foundation",
      lessons: [
        { id: 1, title: "Welcome to the Journey", duration: "12:45", completed: true },
        { id: 2, title: "Your Personality Blueprint", duration: "24:10", completed: true },
        { id: 3, title: "Attachment Styles 101", duration: "31:20", completed: false },
        { id: 4, title: "The Language of Connection", duration: "18:05", completed: false }
      ]
    },
    {
      id: 2,
      title: "Module 2: Invisible Chains",
      locked: true,
      lessons: [
        { id: 5, title: "Recognizing Toxic Patterns", duration: "28:15", completed: false },
        { id: 6, title: "Projection and Shadow", duration: "22:40", completed: false }
      ]
    },
    {
      id: 3,
      title: "Module 3: The Deep Roots",
      locked: true,
      lessons: []
    }
  ];

  const currentModule = modules.find(m => m.id === activeModule) || modules[0];
  const currentLesson = currentModule.lessons.find(l => l.id === activeLesson) || currentModule.lessons[0];

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-background border-r border-primary/10 flex flex-col h-full overflow-y-auto">
        <div className="p-6 border-b border-primary/10 flex items-center justify-between">
          <div className="font-outfit font-bold text-xl text-primary">Healing Hearts.</div>
        </div>

        <div className="p-6">
          <div className="text-xs font-outfit uppercase tracking-widest text-primary/50 font-bold mb-4">Course Progress</div>
          <div className="w-full bg-primary/10 rounded-full h-2 mb-2">
            <div className="bg-accent h-2 rounded-full" style={{ width: '15%' }}></div>
          </div>
          <div className="text-xs text-primary/60 text-right">15% Completed</div>
        </div>

        <nav className="flex-1 px-4 pb-6 space-y-2">
          {modules.map((mod) => (
            <div key={mod.id} className="mb-4">
              <button 
                onClick={() => !mod.locked && setActiveModule(mod.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors \${
                  activeModule === mod.id ? 'bg-primary text-background' : 'hover:bg-primary/5 text-primary'
                } \${mod.locked ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="font-outfit font-medium text-left">{mod.title}</span>
                {mod.locked ? <Lock className="w-4 h-4" /> : <ChevronDown className={`w-4 h-4 transition-transform \${activeModule === mod.id ? 'rotate-180' : ''}`} />}
              </button>

              {activeModule === mod.id && !mod.locked && (
                <div className="mt-2 pl-4 space-y-1">
                  {mod.lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson.id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-colors text-left \${
                        activeLesson === lesson.id ? 'bg-accent/10 text-accent font-medium' : 'text-primary/70 hover:bg-primary/5'
                      }`}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <PlayCircle className="w-4 h-4 opacity-50 flex-shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-primary/10">
          <button onClick={handleLogout} className="flex items-center gap-3 text-primary/70 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/5 w-full">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Return to Site</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background/50">
        {/* Header */}
        <header className="h-20 border-b border-primary/10 bg-background flex items-center px-8 shrink-0">
          <h1 className="font-outfit text-2xl text-primary font-medium">{currentModule.title}</h1>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Video Player Placeholder */}
            <div className="w-full aspect-video bg-primary rounded-3xl overflow-hidden relative shadow-2xl flex flex-col items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <PlayCircle className="w-20 h-20 text-background/80 group-hover:text-background group-hover:scale-110 transition-all z-10" />
              <div className="absolute bottom-6 left-8 text-background z-10">
                <h2 className="font-outfit text-xl font-medium">{currentLesson?.title}</h2>
                <p className="text-background/70 text-sm">{currentLesson?.duration}</p>
              </div>
            </div>

            {/* Lesson Details */}
            <div className="bg-background rounded-3xl p-8 shadow-sm border border-primary/5">
              <h2 className="font-drama italic text-3xl text-primary mb-4">Lesson Notes</h2>
              <div className="prose prose-primary max-w-none text-foreground/80 font-light leading-relaxed">
                <p>Welcome to this lesson. In this session, Jeff and Trisha walk through the foundational elements of attachment geometry.</p>
                <p>Remember to download the accompanying workbook before proceeding, as there are interactive exercises we'll pause for during the video.</p>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-background rounded-3xl p-8 shadow-sm border border-primary/5">
              <h3 className="font-outfit font-bold text-xl text-primary mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" /> Downloads & Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="flex items-center gap-3 p-3 rounded-xl border border-primary/10 hover:border-accent hover:bg-accent/5 transition-colors text-primary group">
                    <FileText className="w-5 h-5 text-primary/50 group-hover:text-accent" />
                    <span className="font-medium text-sm">Module 1 Workbook PDF</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-3 p-3 rounded-xl border border-primary/10 hover:border-accent hover:bg-accent/5 transition-colors text-primary group">
                    <BookOpen className="w-5 h-5 text-primary/50 group-hover:text-accent" />
                    <span className="font-medium text-sm">The 90-Second Wave Guide</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Next buttons */}
            <div className="flex justify-between items-center pt-8 border-t border-primary/10 pb-16">
               <button className="px-6 py-3 rounded-full text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 transition-colors">
                 Previous Lesson
               </button>
               <button className="px-8 py-3 rounded-full text-sm font-medium text-background bg-accent hover:bg-accent/90 transition-colors shadow-lg">
                 Mark Complete & Next
               </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default CoursePortal;
