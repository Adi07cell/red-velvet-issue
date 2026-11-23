/* ==========================================================================
   The score — four tracks, all played live. Original, except the
   "Happy Birthday to You" melody, which is in the public domain.
   ========================================================================== */
const eight = (...bars) => bars.flat();

// 1 · nu-disco / French touch — cover, feed, gala, the diner
Music.define('spotted', {
  title: 'Spotted at Midnight', sub: 'Disco', bpm: 118, meter: 4, style: 'groove', lead: 'ep', voice: .011, voiceOct: 0,
  strings: .006, stringsCut: 2200, drumVel: .85,
  mel: eight(
    [[0, 1], [78, .5], [81, .5], [83, 1], [81, 1]], [[78, .5], [76, 1], [74, .5], [0, 2]],
    [[0, .5], [79, .5], [81, .5], [83, .5], [86, 1], [83, 1]], [[81, 1.5], [78, .5], [76, 2]],
    [[0, 1], [78, .5], [81, .5], [86, 1], [85, 1]], [[83, .5], [81, 1], [78, .5], [0, 2]],
    [[81, .75], [81, .25], [83, 1], [81, 1], [86, 1]], [[85, 2], [0, 2]]),
  chords: [['Dmaj9', 4], ['Bm9', 4], ['Gmaj9', 4], ['Asus4', 2], ['A', 2], ['Dmaj9', 4], ['Bm9', 4], ['Gmaj9', 4], ['Asus4', 2], ['A', 2]],
  comp: { inst: 'ep', steps: [2, 6, 10, 14], len: .22, vel: .34 },
  bass: [[0, 'r'], [2, '8'], [4, 'r'], [6, '8'], [8, 'r'], [10, '8'], [12, 'r'], [14, '8']], bassLen: .2,
  drums: { kick: [0, 4, 8, 12], clap: [4, 12], hat: [1, 3, 5, 7, 9, 11, 13, 15], ohat: [2, 6, 10, 14] },
});

// 2 · bossa lounge — the nightstand, the bar cart
Music.define('poolside', {
  title: 'Piña Colada, Poolside', sub: 'Bossa', bpm: 132, meter: 4, style: 'groove', lead: 'flute', leadGain: .05,
  strings: .005, stringsCut: 1400, drumVel: .8,
  mel: eight(
    [[81, 1.5], [79, .5], [77, 1], [0, 1]], [[78, 1], [81, 1], [84, 2]],
    [[82, 1.5], [81, .5], [79, 2]], [[76, 1], [79, 1], [81, 2]],
    [[84, 1.5], [81, .5], [79, 1], [76, 1]], [[78, 2], [81, 1], [84, 1]],
    [[82, 1], [81, 1], [79, 1], [77, 1]], [[79, 2], [0, 2]]),
  chords: [['Fmaj9', 4], ['D7b9', 4], ['Gm9', 4], ['C13', 4], ['Am7', 4], ['D9', 4], ['Gm9', 4], ['C7sus4', 2], ['C7', 2]],
  comp: { inst: 'ep', steps: [0, 3, 6, 10, 12], len: .3, vel: .34 },
  bass: [[0, 'r'], [6, '5'], [8, '5'], [14, 'r']], bassLen: .32,
  drums: { rim: [0, 3, 6, 10, 12], shaker: [0, 2, 4, 6, 8, 10, 12, 14], kick: [0, 8] },
});

// 3 · lo-fi — the receipt, the cake, the letter
Music.define('velvet', {
  title: 'Red Velvet, Slowly', sub: 'Lo-fi', bpm: 78, meter: 4, style: 'groove', lead: 'ep', swing: .6, crackle: true,
  strings: .007, stringsCut: 1300, drumVel: .7,
  mel: eight(
    [[0, 1], [79, 1], [82, 1], [86, 1]], [[84, 2], [82, 1], [79, 1]],
    [[0, 1], [80, 1], [84, 1], [87, 1]], [[86, 2], [84, 1], [82, 1]],
    [[0, 1], [79, .5], [82, .5], [86, 1], [87, 1]], [[84, 2], [79, 2]],
    [[0, 1], [80, 1], [82, 1], [84, 1]], [[82, 3], [0, 1]]),
  chords: [['Ebmaj9', 4], ['Cm9', 4], ['Abmaj9', 4], ['Bb7sus4', 4], ['Ebmaj9', 4], ['Cm9', 4], ['Abmaj9', 4], ['Bb7sus4', 4]],
  comp: { inst: 'ep', steps: [0, 6, 10], len: .9, vel: .38 },
  bass: [[0, 'r'], [8, '5'], [11, 'r']], bassLen: .6,
  drums: { kick: [0, 7, 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14] },
});

// 4 · "Happy Birthday" re-metered to 4/4 as a lo-fi Rhodes ballad — plays when she cuts the cake
Music.define('birthday', {
  title: 'Happy Birthday, Slowly', sub: 'Birthday', bpm: 76, meter: 4, style: 'groove', lead: 'ep', voice: .02, voiceOct: 0, swing: .5, crackle: true,
  strings: .01, stringsCut: 1800, drumVel: .6,
  mel: eight(
    [[70, .75], [70, .25], [72, 1], [70, 1], [75, 1]], [[74, 4]],
    [[70, .75], [70, .25], [72, 1], [70, 1], [77, 1]], [[75, 4]],
    [[70, .75], [70, .25], [82, 1], [79, 1], [75, 1]], [[74, 1], [72, 3]],
    [[80, .75], [80, .25], [79, 1], [75, 1], [77, 1]], [[75, 4]]),
  chords: [['Ebmaj7', 4], ['Bb7', 4], ['Bb7', 4], ['Ebmaj7', 4], ['Eb7', 4], ['Abmaj7', 4], ['Eb/Bb', 2], ['Bb7', 2], ['Eb69', 4]],
  comp: { inst: 'ep', steps: [0, 8], len: 1.2, vel: .3 },
  bass: [[0, 'r'], [8, '5']], bassLen: .9,
  drums: { kick: [0, 10], snare: [8], hat: [0, 2, 4, 6, 8, 10, 12, 14] },
});

// Which track plays in which part of the issue (on Auto).
const SCORE = { cover: 'spotted', feed: 'spotted', gala: 'spotted', books: 'poolside', diner: 'spotted', bar: 'poolside', joys: 'velvet', cake: 'velvet', letter: 'velvet' };
