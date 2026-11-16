// Activities taken from brands' own websites, matched to our models by the model code.
// Used until Shoof has an Activity field (Shoof's value always wins) and until activities can be set by hand in the dashboard.
//
// Maui Jim: mauijim.com/activities/<golfing|fishing|running|hiking|water-sports|tennis|driving>, collected 2026-11-16.
// The site lists styles by number (variantCode "DGS376-01A" = style 376); our Shoof code "MJ0376S" is the same style.
// Maui Jim's "Water Sports" is shown on our site as Beach and Diving. To refresh: open each activity page, press
// "See More" until all styles show, and read the style numbers from the variantCode of each link.
const MAUI_JIM = {
  GOLF: [257, 336, 358, 363, 364, 369, 407, 412, 432, 433, 439, 447, 449, 456, 636, 676, 680, 685, 798, 811, 875],
  FISHING: [103, 202, 266, 279, 367, 604, 614, 663, 664, 746, 792, 810, 815, 839, 896],
  RUNNING: [339, 358, 363, 364, 369, 370, 371, 374, 407, 412, 421, 422, 423, 432, 433, 443, 447, 449, 454, 456, 595, 676, 680, 682],
  HIKING: [246, 339, 358, 363, 364, 369, 370, 371, 374, 407, 412, 432, 433, 447, 449, 456, 601, 603, 671, 676, 723, 744, 897],
  'WATER SPORTS': [245, 264, 367, 407, 422, 626, 636, 661, 665, 676, 680, 682, 723, 744, 766, 840, 897],
  TENNIS: [363, 364, 369, 370, 371, 407, 412, 421, 422, 423, 433, 439, 443, 449, 454, 456, 626, 676, 680, 685],
  DRIVING: [257, 339, 342, 344, 355, 358, 359, 360, 361, 362, 369, 376, 432, 621, 634, 642, 661, 682, 689, 723, 728, 744, 758, 766, 811, 875],
};
// Brand-site activity names -> the activities in our menu.
const AS_OURS = { 'WATER SPORTS': ['BEACH', 'DIVING'] };

const byStyle = new Map();
for (const [act, styles] of Object.entries(MAUI_JIM)) {
  for (const n of styles) {
    const list = byStyle.get(n) || [];
    for (const a of AS_OURS[act] || [act]) if (!list.includes(a)) list.push(a);
    byStyle.set(n, list);
  }
}

// Brands whose activities come from their website: their models get only what the brand lists (no general rule).
export const BRANDS_WITH_SITE_DATA = new Set(['MAUI JIM']);

export function brandActivities(brand, model) {
  if (String(brand).toUpperCase() !== 'MAUI JIM') return [];
  const m = String(model).trim().toUpperCase().match(/^MJ0?(\d{3,4})/);
  return m ? byStyle.get(+m[1]) || [] : [];
}
