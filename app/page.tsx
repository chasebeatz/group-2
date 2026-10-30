"use client";

import { useActionState, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { checkNote, type Note } from "./actions";

const STORAGE_KEY = "notes";

const initialState = {
  error: "",
  note: null,
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [state, formAction, isPending] = useActionState(checkNote, initialState);

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags))).sort();
  const visibleNotes = notes.filter((note) => {
    const matchesTag = activeTag ? note.tags.includes(activeTag) : true;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      note.title.toLowerCase().includes(query) ||
      note.body.toLowerCase().includes(query);

    return matchesTag && matchesSearch;
  });

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes) as Note[];
        if (Array.isArray(parsedNotes)) {
          setNotes(parsedNotes);
        }
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage.", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save notes to localStorage.", error);
    }
  }, [notes, isHydrated]);

  useEffect(() => {
    if (state.note) {
      setNotes((current) => [state.note as Note, ...current]);
    }
  }, [state.note]);

  const handleDelete = (indexToDelete: number) => {
    setNotes((current) => current.filter((_, index) => index !== indexToDelete));
  };

  return (
    <main
      className="min-h-screen w-full bg-cover bg-center bg-fixed px-4 py-5 sm:px-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(9, 14, 22, 0.68), rgba(15, 23, 42, 0.82)), url('https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-5 sm:gap-6">
        <header className="flex items-center gap-3 rounded-[22px] border border-white/20 bg-white/8 px-3 py-3 shadow-[0_18px_50px_rgba(5,8,15,0.32)] backdrop-blur-xl sm:px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_#f5f5f4,_#d6d3d1_30%,_#3f3f46_100%)] text-lg font-black text-zinc-900 shadow-lg shadow-zinc-950/30 ring-1 ring-white/40">
            C
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-200">
              chasebeatz
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">note</h1>
          </div>
        </header>

        <form
          action={formAction}
          className="space-y-4 rounded-[26px] border border-white/15 bg-white/78 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:space-y-5 sm:p-6"
        >
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-semibold text-zinc-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            className="w-full rounded-xl border border-zinc-300 bg-white/80 px-3 py-2.5 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:bg-white"
            placeholder="Enter a title"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="body" className="block text-sm font-semibold text-zinc-700">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={5}
            className="w-full rounded-xl border border-zinc-300 bg-white/80 px-3 py-2.5 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:bg-white"
            placeholder="Write your note"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tags" className="block text-sm font-semibold text-zinc-700">
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            className="w-full rounded-xl border border-zinc-300 bg-white/80 px-3 py-2.5 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:bg-white"
            placeholder="work, personal, ideas"
          />
        </div>

        {state.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 shadow-sm" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add note"}
        </button>
      </form>

        <section className="space-y-4 rounded-[26px] border border-white/15 bg-slate-900/30 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white sm:text-xl">Saved notes</h2>

            {allTags.length > 0 ? (
              <button
                type="button"
                onClick={() => setActiveTag(null)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeTag === null
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "bg-white/10 text-zinc-100 hover:bg-white/20"
                }`}
              >
                All
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="search" className="block text-sm font-medium text-zinc-200">
              Search notes
            </label>
            <input
              id="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or body"
              className="w-full rounded-xl border border-white/15 bg-white/8 px-3 py-2.5 text-base text-white placeholder:text-zinc-300 outline-none transition focus:border-white/50 focus:bg-white/12"
            />
          </div>

          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag((current) => (current === tag ? null : tag))}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    activeTag === tag
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "bg-white/10 text-zinc-100 hover:bg-white/20"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : null}

          {visibleNotes.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-black/10 px-3 py-3 text-sm text-zinc-300">
              {search.trim() || activeTag
                ? "No notes match your search."
                : "No notes yet."}
            </p>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {visibleNotes.map((note, index) => (
                <li key={`${note.title}-${index}`} className="rounded-[22px] border border-zinc-200/80 bg-white/90 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">{note.title}</h3>
                    <button
                      type="button"
                      onClick={() => handleDelete(notes.indexOf(note))}
                      className="shrink-0 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-2 text-zinc-700 [&_h1]:mt-0 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-zinc-900 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_p]:my-2 [&_strong]:font-semibold [&_strong]:text-zinc-900">
                    <ReactMarkdown>{note.body}</ReactMarkdown>
                  </div>

                  {note.tags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {note.tags.map((tag) => (
                        <button
                          key={`${tag}-${index}`}
                          type="button"
                          onClick={() => setActiveTag((current) => (current === tag ? null : tag))}
                          className={`rounded-full px-2 py-1 text-xs font-medium transition ${
                            activeTag === tag
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
