// Generates English-only people for the store screenshots (deterministic).
import { faker } from "@faker-js/faker";
import fs from "node:fs";

faker.seed(2610);
const first = (initial) => {
  for (let i = 0; i < 500; i++) {
    const n = faker.person.firstName();
    if (n.startsWith(initial) && /^[A-Za-z]+$/.test(n) && n.length >= 3 && n.length <= 6) return n;
  }
  throw new Error(`no first name for ${initial}`);
};
const last = () => {
  for (let i = 0; i < 500; i++) {
    const n = faker.person.lastName();
    if (/^[A-Z][a-z]+$/.test(n) && n.length >= 4 && n.length <= 8) return n;
  }
  throw new Error("no last name");
};
const handle = (f, l) => `${f}.${l}`.toLowerCase().replace(/[^a-z.]/g, "");
const person = (initial) => {
  const f = first(initial), l = last();
  return { first: f, last: l, name: `${f} ${l}`, user: handle(f, l) };
};
const me = person("N"); me.user = `${me.first}.reads`.toLowerCase(); me.email = `${handle(me.first, me.last)}@gmail.com`;
const people = {
  luka: person("L"), ana: person("A"), maja: person("M"), tine: person("T"),
  anamarija: person("A"), hana: person("H"), anze: person("A"),
};
for (const k of ["luka", "ana", "anamarija", "anze"]) people[k].user = handle(people[k].first, people[k].last.slice(0, 1));
people.ana.user = `${people.ana.first}${faker.string.alpha({ length: 2, casing: "lower" })}`.toLowerCase();
people.hana.user = `${people.hana.first}.reads`.toLowerCase();
const bios = {
  ana: "Reads classics and the occasional thriller. Mostly Russians.",
  anamarija: "Poetry, mostly. Some science fiction on trains.",
  hana: "Bookseller in Portland. Ask me about translated fiction.",
  anze: "Crime novels and cycling books.",
};
const handleOnly = `${faker.word.adjective({ length: { min: 3, max: 5 } })}_${faker.word.noun({ length: { min: 3, max: 5 } })}`.toLowerCase().replace(/[^a-z_]/g, "");
fs.writeFileSync("data.json", JSON.stringify({ me, people, bios, handleOnly, city: "Portland" }, null, 2));
console.log(JSON.stringify({ me, people, handleOnly }, null, 1));
