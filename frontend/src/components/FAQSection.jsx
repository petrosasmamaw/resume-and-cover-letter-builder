import { useState } from 'react';
import { IconChevronDown, IconSearch, IconHelp } from './ui.jsx';

export const FAQ_DATA = [
  {
    id: 1,
    category: 'General',
    question: 'What is ResumeForge and how does it work?',
    answer:
      'ResumeForge is an AI-powered document generator that takes your verified professional profile (experiences, projects, skills, education) and automatically tailors targeted resumes and cover letters for specific job descriptions. It scores your profile match, highlights missing keywords, and optimizes for Applicant Tracking Systems (ATS).',
  },
  {
    id: 2,
    category: 'General',
    question: 'Is ResumeForge free to use?',
    answer:
      'Yes! You can create your master profile, generate tailored resumes, analyze job description matches, and download PDF or HTML versions for free.',
  },
  {
    id: 3,
    category: 'AI & Match',
    question: 'How does the AI Requirement Match scoring work?',
    answer:
      'Our AI analyzes the job posting to extract key required skills, years of experience, and role expectations. It then cross-references your master profile to calculate a match percentage score, listing exact strengths, matched keywords, and suggestions to boost your score.',
  },
  {
    id: 4,
    category: 'AI & Match',
    question: 'Will the generated resume pass ATS (Applicant Tracking Systems)?',
    answer:
      'Absolutely. ResumeForge generates clean, single-column, standard-compliant HTML and PDF documents formatted specifically to parse cleanly through modern ATS tools like Greenhouse, Lever, Workday, and Taleo.',
  },
  {
    id: 5,
    category: 'Privacy',
    question: 'Is my personal information secure?',
    answer:
      'Your privacy is our top priority. Your profile data and generated documents are stored securely with encrypted databases and are never shared with third parties or used to train public AI models.',
  },
  {
    id: 6,
    category: 'Export',
    question: 'What formats can I export my resume and cover letter in?',
    answer:
      'You can instantly preview, print, or download your generated resumes and cover letters in high-resolution PDF format, standard HTML, or plain text.',
  },
  {
    id: 7,
    category: 'Export',
    question: 'Can I edit the generated content before sending it?',
    answer:
      'Yes! Every generated resume and cover letter can be edited inline or saved to your personal history for quick access and tweaking at any time.',
  },
  {
    id: 8,
    category: 'General',
    question: 'Can I generate cover letters as well?',
    answer:
      'Yes, ResumeForge generates matching, professionally crafted cover letters tailored to both your profile and the specific company and job title you are applying for.',
  },
];

export default function FAQSection({ limit = null, showHeader = true, compact = false }) {
  const [openId, setOpenId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'General', 'AI & Match', 'Privacy', 'Export'];

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory =
      activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedFaqs = limit ? filteredFaqs.slice(0, limit) : filteredFaqs;

  return (
    <div className="w-full space-y-6">
      {showHeader && (
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-navy text-xs font-bold uppercase tracking-wider border border-line-accent">
            <IconHelp className="w-4 h-4 text-accent" />
            Frequently Asked Questions
          </div>
          <h2 className="rf-page-title !text-2xl md:!text-3xl">
            Everything you need to know
          </h2>
          <p className="rf-page-sub text-sm mx-auto">
            Got questions about AI resume generation, ATS scoring, or data privacy? We’ve got answers.
          </p>
        </div>
      )}

      {/* Filter and Search Bar */}
      {!limit && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl mx-auto">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeCategory === cat
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-panel border border-line text-ink-muted hover:text-ink hover:border-line-strong'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <input
              type="text"
              placeholder="Search questions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rf-input !py-1.5 !pl-9 !pr-3 !text-xs !rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Accordion List */}
      <div className="max-w-3xl mx-auto space-y-3">
        {displayedFaqs.length === 0 ? (
          <div className="rf-card p-8 text-center text-ink-muted text-sm">
            No questions matched your search criteria. Try a different query or category.
          </div>
        ) : (
          displayedFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rf-card transition-all duration-200 ${
                  isOpen
                    ? 'border-navy shadow-soft bg-white'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-navy hover:text-accent transition-colors"
                >
                  <span className="text-sm sm:text-base leading-snug">{faq.question}</span>
                  <div
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-surface transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-accent-soft text-navy' : 'text-ink-muted'
                    }`}
                  >
                    <IconChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 pt-0 sm:px-5 text-xs sm:text-sm text-ink-muted leading-relaxed border-t border-line/50 mt-1 pt-3 rf-enter">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
