import { useState } from 'react';
import { IconChevronDown, IconSearch } from './ui.jsx';

export const FAQ_DATA = [
  {
    id: 1,
    category: 'General',
    question: 'What is ResumeForge, in one sentence?',
    answer:
      'ResumeForge takes the professional profile you save once, then generates job-specific resumes and cover letters that stay grounded in that profile — plus chat answers for client questions and marketplace-safe contact options.',
  },
  {
    id: 2,
    category: 'General',
    question: 'Is ResumeForge free to use?',
    answer:
      'Yes. You can create an account, build a profile, generate documents, use Career chat, and download PDFs without paying to start. Any future paid plans would be announced in the product — nothing is hidden behind fake “enterprise only” walls today.',
  },
  {
    id: 3,
    category: 'AI & Match',
    question: 'Will the AI invent jobs or skills I do not have?',
    answer:
      'No. Your Profile (and Special notes you write for one generation) is the fact base. The model reorders, emphasizes, and rephrases real experience for a posting. If something is missing, add it to Profile or Special notes — do not expect the model to fabricate it.',
  },
  {
    id: 4,
    category: 'AI & Match',
    question: 'What is Requirement Match?',
    answer:
      'After a generation that includes a resume, ResumeForge can show how pieces of the job posting line up with skills, roles, or projects from your profile. Treat it as a coaching lens for Special notes and interviews — not a guarantee of hire.',
  },
  {
    id: 5,
    category: 'Privacy',
    question: 'Who can see my profile and documents?',
    answer:
      'Your data is scoped to your authenticated account in this app. We do not sell your résumé content, and you should treat generated PDFs as documents you alone choose to send to employers or clients.',
  },
  {
    id: 6,
    category: 'Export',
    question: 'Which formats can I export?',
    answer:
      'You can preview on the Generate page and download a resume PDF. Cover letters can be copied as text. Templates are ATS-oriented single-column layouts.',
  },
  {
    id: 7,
    category: 'Export',
    question: 'What does Upwork-safe (no contact) mean?',
    answer:
      'It hides email, phone, address, LinkedIn, GitHub, and portfolio from the resume PDF so proposals are less likely to violate marketplace rules against off-platform contact. Skills, experience, and projects remain. Use “With contact” for company or email applications.',
  },
  {
    id: 8,
    category: 'General',
    question: 'How does Career chat differ from Generate?',
    answer:
      'Chat uses the same profile to help you answer Upwork/client questions, draft Special notes, and talk through fit. Generate produces the formal resume and cover letter documents for that job.',
  },
  {
    id: 9,
    category: 'AI & Match',
    question: 'What are Special notes?',
    answer:
      'Optional instructions for one generation only — for example “emphasize the payments migration; omit WordPress.” They do not permanently change Profile. Chat can draft paste-ready Special notes from a job description.',
  },
  {
    id: 10,
    category: 'Privacy',
    question: 'Can I use this for freelancing and traditional job hunting?',
    answer:
      'Yes. The same profile feeds both. Switch contact mode, Special notes, and templates to match marketplace proposals versus company applications.',
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
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-navy tracking-tight">
            Common questions
          </h2>
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            Profile ground truth, Special notes, Upwork-safe contact, chat vs generate, and exports.
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
                className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${
                  activeCategory === cat
                    ? 'bg-accent text-white'
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
                    ? 'border-accent shadow-soft bg-white'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-semibold text-navy hover:text-accent-dim transition-colors"
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
