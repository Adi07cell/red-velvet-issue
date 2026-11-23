/* ==========================================================================
   EVERYTHING SHE READS LIVES HERE — edit freely.
   ========================================================================== */
const CONFIG = {
  name: 'Rishika',
  initial: 'R.',
  from: 'Chennai',
  // Your best score in the pancake stack. Play it once and put your real score here.
  hisScore: 17,
  // Your WhatsApp number with country code, digits only. Empty = WhatsApp asks her who to send to.
  whatsapp: '',
};

const NOTIFS = [
  { app: 'Gossip Girl', icon: 'xo', time: 'now', title: 'Spotted', body: 'R., officially 22 as of midnight. Rumoured to own both stilettos and sneakers — and refusing to choose. You know you love me. XOXO, Gossip Girl' },
  { app: 'Calendar', icon: 'cal', time: 'today', title: 'Her birthday', body: 'All day. Every year. Non-negotiable.' },
  { app: 'Weather', icon: 'sun', time: '00:00', title: 'Forecast for the birthday girl', body: 'Chance of waffles: 100%. Mild plot twists by evening.' },
  { app: 'Lab Notebook', icon: 'lab', time: '00:00', title: 'Result', body: 'Gel ran clean on the first try. Birthday miracle confirmed.' },
  { app: 'Messages', icon: 'msg', time: 'now', title: CONFIG.from, body: 'Swipe up. I made you something.' },
];

const FACTS = [
  { k: 'Days on this planet', v: '8,035', note: 'and every one of them suspiciously fun' },
  { k: 'You arrived on a', v: 'Wednesday', note: 'on Wednesdays we wear pink — it was 2004, after all' },
  { k: 'Same year', v: 'Piña colada turned 50', note: 'you two were always meant to meet' },
  { k: '24 November is', v: 'Evolution Day', note: 'Origin of Species came out on your birthday. Biotech was written in the stars.' },
  { k: 'Sign', v: 'Sagittarius', note: 'funny, curious, honest to the point of blunt. Accurate.' },
  { k: 'Birthstone', v: 'Topaz', note: 'golden. Obviously.' },
];

// Death-by-Chocolate Stack
const STACK = {
  milestones: {
    5: 'Five high. The waffle iron is impressed.',
    10: 'Ten! Chocolate drizzle unlocked.',
    15: 'Fifteen. Strawberries unlocked. Show-off.',
    22: 'TWENTY-TWO. Whipped-cream crown, Your Highness.',
  },
};

// Plot Twist Bingo (4×4). One square is free.
const BINGO = [
  'Morally grey', 'Touch her and die', 'Enemies to lovers', '“Who did this to you?”',
  'Only one bed', 'He falls first', 'FREE: Birthday girl', 'Grumpy × sunshine',
  'Slow burn', 'Fake dating', 'Soft only for her', 'Dark academia',
  'Unreliable narrator', 'A Damon smirk', 'Met-steps entrance', 'One more chapter at 3 a.m.',
];
const BINGO_LINES = [
  'BINGO! Two little ducks — twenty-two!',
  'BINGO. You’ve survived more plot twists than most main characters.',
  'BINGO. Your TBR pile just felt that.',
  'BINGO. The book hangover will be legendary.',
  'BINGO. Annotated, tabbed, and emotionally destroyed. As intended.',
];

// Piña Colada Catch
const CATCH = {
  good: [
    { id: 'pineapple', label: 'pineapple', pts: 1 },
    { id: 'coconut', label: 'coconut', pts: 1 },
    { id: 'ice', label: 'ice', pts: 1 },
    { id: 'splash', label: 'a splash of rum', pts: 2 },
    { id: 'cherry', label: 'a cherry', pts: 2 },
  ],
  bad: [
    { id: 'vervain', label: 'vervain', msg: 'Vervain! Every vampire in the bar just flinched.' },
    { id: 'deadline', label: 'a deadline', msg: 'A deadline. Not today. Today is your birthday.' },
    { id: 'petri', label: 'a petri dish', msg: 'Lab equipment is not a garnish. Probably.' },
  ],
  verdicts: [
    [0, 'A bold, minimalist choice. Mostly ice. Very avant-garde.'],
    [8, 'Respectable. The bartender nods.'],
    [16, 'Tropical. Dangerous. Excellent.'],
    [26, 'This is the best piña colada in the history of piña coladas. It turned 50 the year you were born — and it still peaked tonight.'],
  ],
};

// Spotted at the Gala
const GALA = {
  silhouette: [['mermaid', 'Mermaid'], ['ballgown', 'Ball gown'], ['slip', 'Slip dress']],
  color: [['ivory', 'Ivory', '#F4EDE1'], ['champagne', 'Champagne', '#E3C9A0'], ['velvet', 'Velvet red', '#8E1B2E'], ['midnight', 'Midnight', '#1B1820']],
  shoes: [['stilettos', 'Stilettos'], ['sneakers', 'Sneakers'], ['both', 'Both, obviously']],
  shoeLine: {
    stilettos: 'in stilettos sharp enough to end an argument',
    sneakers: 'in — wait — sneakers. Under a gown. Iconic.',
    both: 'in stilettos for the entrance and sneakers for the after-party',
  },
};

// Receipt of Small Joys — 22 things that cost nothing
const JOYS = [
  'The first page of a new book, before you know anyone’s name',
  'Melted chocolate pooling in the waffle squares',
  'Rain, cha in a clay bhaar, and absolutely no plans',
  'A line so good you put the book down and stare at the wall',
  '“One more chapter” that quietly becomes five',
  'A gel that runs clean on the first try',
  'Clean sheets and freshly washed hair on the same night',
  'A Kinder Joy toy you actually wanted',
  'Finding ₹100 in old jeans',
  'A window seat, earphones in, music-video mode',
  'Kicking off heels for sneakers at the end of the night',
  'A secondhand book with a stranger’s note in the margin',
  'The phuchka-wala remembering exactly how spicy you like it',
  'A Harry Potter marathon with nowhere to be',
  'Fairy lights in a dark room',
  'A plushie in a chokehold during a cliffhanger',
  'A sentence you wrote and reread six times because it’s that good',
  'The first nolen gur sandesh of winter',
  'A Sunday bhaat-ghum',
  'A plot twist you genuinely didn’t see coming',
  'Laughing so hard you have to put your phone down',
  'Payesh on a birthday morning',
];
const RECEIPT_NOTE = [
  'Something tells me you’d pick a quiet, perfect little moment over anything expensive.',
  'So I didn’t buy you twenty-two things.',
  'I’m wishing you all twenty-two instead.',
];

// Finale
const FINALE = {
  waldorf: 'Legend has it red velvet was first served at the Waldorf. So technically, this cake is a Waldorf. Blair would approve.',
  real: 'This one’s made of pixels. The real one is red velvet too — and if it hasn’t found you yet, it’s on its way.',
  steps: ['Ordered from Chennai', 'Baked', 'Frosted (generously)', 'Finding its way to you'],
  wish: [
    'Happy birthday, Rishika.',
    'Twenty-two looks good on you — I suspect most things do.',
    'I hope this year is full of good books, better plot twists, crisp waffles, and people who make you laugh till it hurts.',
    'If the real one survives long enough, I’d love a photo of the first slice.',
  ],
  sign: 'XOXO, Chennai',
};

const SONGS = {};
