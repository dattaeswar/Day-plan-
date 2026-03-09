/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Clock, 
  Tag,
  ChevronRight,
  LayoutGrid,
  ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Category } from './types';
import { suggestSchedule } from './services/gemini';

const CATEGORIES: Category[] = ['Work', 'Personal', 'Health', 'Urgent', 'Other'];

const CATEGORY_COLORS: Record<Category, string> = {
  Work: 'bg-blue-100 text-blue-700 border-blue-200',
  Personal: 'bg-purple-100 text-purple-700 border-purple-200',
  Health: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Urgent: 'bg-rose-100 text-rose-700 border-rose-200',
  Other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Work');
  const [isPlanning, setIsPlanning] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('list');

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dayplan_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
      }
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('dayplan_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      completed: false,
      category: selectedCategory,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAISchedule = async () => {
    if (tasks.length === 0) return;
    setIsPlanning(true);
    const suggestions = await suggestSchedule(tasks);
    
    if (suggestions.length > 0) {
      setTasks(prev => prev.map(task => {
        const suggestion = suggestions.find(s => s.id === task.id);
        if (suggestion) {
          return {
            ...task,
            startTime: suggestion.startTime,
            endTime: suggestion.endTime
          };
        }
        return task;
      }));
    }
    setIsPlanning(false);
  };

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
      return b.createdAt - a.createdAt;
    });
  }, [tasks]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Calendar className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">DayPlan AI</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView(view === 'list' ? 'grid' : 'list')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Toggle View"
            >
              {view === 'list' ? <LayoutGrid size={20} /> : <ListTodo size={20} />}
            </button>
            <button 
              onClick={handleAISchedule}
              disabled={isPlanning || tasks.length === 0}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-100 shadow-sm"
            >
              <Sparkles size={16} className={isPlanning ? 'animate-pulse' : ''} />
              {isPlanning ? 'Planning...' : 'AI Schedule'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Section */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-1">Your Day</h2>
              <p className="text-slate-500">You've completed {tasks.filter(t => t.completed).length} of {tasks.length} tasks today.</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-indigo-600">{progress}%</span>
            </div>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
            />
          </div>
        </section>

        {/* Add Task Form */}
        <section className="mb-10">
          <form onSubmit={addTask} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95"
                >
                  <Plus size={24} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selectedCategory === cat 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </section>

        {/* Task List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Tasks</h3>
            <div className="h-px flex-1 mx-4 bg-slate-200" />
          </div>

          <div className={view === 'list' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
            <AnimatePresence mode="popLayout">
              {sortedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group bg-white p-4 rounded-2xl border transition-all flex items-center gap-4 ${
                    task.completed 
                      ? 'border-slate-100 opacity-60' 
                      : 'border-slate-200 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/50'
                  }`}
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`transition-colors ${task.completed ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-400'}`}
                  >
                    {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded border ${CATEGORY_COLORS[task.category]}`}>
                        {task.category}
                      </span>
                      {task.startTime && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Clock size={10} />
                          {task.startTime} - {task.endTime}
                        </div>
                      )}
                    </div>
                    <h4 className={`font-semibold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.title}
                    </h4>
                  </div>

                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {tasks.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="text-slate-300 w-8 h-8" />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">No tasks yet</h3>
                <p className="text-slate-500 text-sm">Add your first task to start planning your day.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer / Meta */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <Sparkles size={12} className="text-indigo-500" />
          Powered by Gemini AI
        </div>
      </footer>
    </div>
  );
}
