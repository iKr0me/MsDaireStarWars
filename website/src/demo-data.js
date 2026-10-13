const notes = [
  {
    id: "sample-alex",
    sender: "Alex · sample",
    message: "We miss you, Ms. Daire. Hope you feel better soon!",
  },
  {
    id: "sample-rowan",
    sender: "Rowan · sample",
    message: "Wishing you a smooth recovery. See you when you’re ready.",
  },
  {
    id: "sample-casey",
    sender: "Casey · sample",
    message: "Get well soon, Ms. Daire!",
  },
  {
    id: "sample-sam",
    sender: "Sam · sample",
    message: "Thank you for everything you do for us. Hope you’re feeling better.",
  },
  {
    id: "sample-ari",
    sender: "Ari · sample",
    message: "Thinking of you and wishing you a speedy recovery.",
  },
  {
    id: "sample-nico",
    sender: "Nico · sample",
    message: "Hope you get plenty of rest and feel better soon.",
  },
];
export function createDemoAdapter() {
  return {
    mode: "demo",
    async list() {
      return notes.map((n) => ({ ...n }));
    },
    async get(id) {
      const n = notes.find((n) => n.id === id);
      return n ? { ...n } : null;
    },
  };
}
