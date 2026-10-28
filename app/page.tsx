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

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-6">
      <h1 className="text-3xl font-semibold">Notes</h1>

      <form
        action={formAction}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-zinc-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-0 transition focus:border-zinc-500"
            placeholder="Enter a title"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="body" className="block text-sm font-medium text-zinc-700">
            Body
          </label>
          <textarea
            id="body"
            name="body"
            rows={5}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none transition focus:border-zinc-500"
            placeholder="Write your note"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tags" className="block text-sm font-medium text-zinc-700">
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none transition focus:border-zinc-500"
            placeholder="work, personal, ideas"
          />
        </div>

        {state.error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Add note"}
        </button>
      </form>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Saved notes</h2>

          {allTags.length > 0 ? (
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeTag === null
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
              }`}
            >
              All
            </button>
          ) : null}
        </div>

        <div className="space-y-3">
          <label htmlFor="search" className="block text-sm font-medium text-zinc-700">
            Search notes
          </label>
          <input
            id="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or body"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none transition focus:border-zinc-500"
          />
        </div>

        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag((current) => (current === tag ? null : tag))}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
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

        {visibleNotes.length === 0 ? (
          <p className="text-zinc-500">
            {search.trim() || activeTag
              ? "No notes match your search."
              : "No notes yet."}
          </p>
        ) : (
          <ul className="space-y-4">
            {visibleNotes.map((note, index) => (
              <li key={`${note.title}-${index}`} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <h3 className="text-lg font-semibold">{note.title}</h3>
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
    </main>
  );
}
