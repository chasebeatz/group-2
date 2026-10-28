"use server";

export type Note = {
  title: string;
  body: string;
  tags: string[];
};

export type NoteActionState = {
  error?: string;
  note?: Note | null;
};

export async function checkNote(
  prevState: NoteActionState | undefined,
  formData: FormData,
): Promise<NoteActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  if (!title) {
    return { error: "Title is required." };
  }

  if (!body) {
    return { error: "Body is required." };
  }

  const uniqueTags = [...new Set(tags)];

  return {
    note: {
      title,
      body,
      tags: uniqueTags,
    },
  };
}
