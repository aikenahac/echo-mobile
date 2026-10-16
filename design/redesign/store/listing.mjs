import fs from "node:fs";
const promo = "Log the page you stopped on. Stamp a book FINISHED. See what your friends are reading, without ads or a feed that tries to sell you something.";
const desc = `Echo is a reading tracker for people who read a book or three a month and want to remember them.

Open the app and the book you are reading is the first thing you see, with the page you are on in big type. Tap Next page, or drag the number like a numbering stamp. That is the whole routine.

LOG WHERE YOU STOPPED
Set your page in a second. Echo moves a book to Reading when you start it and to Finished when you reach the last page, so you never sort a shelf by hand.

FINISH IT PROPERLY
Reach the final page and a FINISHED stamp lands on the cover. Rate it with five stars and write a review if you have something to say. Reviews can be public or private, and you can edit them any time.

YOUR SHELVES
Reading, Want to read, Finished and Favourites. Switch between a grid of covers and a list. The list shows when you finished each book and how you rated it.

FIND ANY BOOK
Search the Echo catalogue and Open Library, then add a book as Want to read, Reading or Finished in one tap.

SEE WHAT FRIENDS ARE READING
Follow other readers and watch them start books, finish them and review them. You see their reviews on a book's page too, under "From people you follow". Nothing is ranked, and nothing is promoted.

COLLECTIONS
Group books into shelves you name yourself: "Winter rereads", "Booker shortlist", "Ishiguro, all of it". Pick a colour and an icon, add a cover, keep a collection private or share it with a link. Collections are part of Echo Premium. Everything else in Echo is free, with no limit on how many books you add.

MADE TO LOOK GOOD
Pink for the book you are reading right now, paper for everything else. Real covers, a designed dark mode, and your language and layout remembered between launches.

Questions or ideas: echoreads.app
`;
const keywords = "reading,books,book log,tracker,library,shelf,bookshelf,reviews,reading list,progress,pages,friends";
const out = { promo, desc, keywords };
for (const [k, v] of Object.entries(out)) console.log(k, v.length);
fs.writeFileSync("listing.md", `# App Store listing (English)\n\n## Promotional Text (max 170)\n${promo}\n\n## Description (max 4000)\n${desc}\n## Keywords (max 100)\n${keywords}\n\n## Support URL\nhttps://echoreads.app/support\n\n## Marketing URL\nhttps://echoreads.app\n\n## Version\n1.0\n\n## Copyright (max 200)\n2026 Echo\n`);
