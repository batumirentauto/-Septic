// scripts/replyTemplates.cjs
// Contains the 3 approved motivational Message 2 variants (sent when contractor replies YES/SURE to Message 1).

const MESSAGE_2_TEMPLATES = {
  // Variant A: Authority, Machinery & Established Crew pride
  VAR_A_MACHINERY: (slug) => 
    `Awesome, here it is: https://zonus.co/${slug}\n\nLoaded your real machinery, project photos and 5-star reviews so homeowners searching on their phones see a solid, established crew instead of calling competitors.\n\nTake 30 seconds on your phone - does everything look accurate?`,

  // Variant B: High-ticket $5k-$15k jobs while in the field
  VAR_B_HIGH_TICKET: (slug) =>
    `Here you go: https://zonus.co/${slug}\n\nBuilt it mobile-first with your equipment and services specifically to capture those high-ticket $5k-$15k replacement & repair jobs while you're busy out in the field.\n\nTake a quick look on your phone - what do you think?`,

  // Variant C: Turnkey, Ready to go, Easy adjustments
  VAR_C_TURNKEY: (slug) =>
    `Appreciate it! Here's the live link: https://zonus.co/${slug}\n\nEverything is already set up turnkey - your trucks, services and local area. Take a quick look on your phone. If you want to keep it, just let me know. And if you want any photo or detail tweaked, happy to do it!`
};

function getMessage2(variantKey, slug) {
  const fn = MESSAGE_2_TEMPLATES[variantKey];
  if (!fn) {
    throw new Error(`Unknown Message 2 variant: ${variantKey}. Use VAR_A_MACHINERY, VAR_B_HIGH_TICKET, or VAR_C_TURNKEY`);
  }
  return fn(slug);
}

module.exports = {
  MESSAGE_2_TEMPLATES,
  getMessage2
};
