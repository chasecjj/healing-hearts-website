/**
 * Generator: Migration 006 — Module 7.4 Revised Content
 * Source: 7-Agent Pipeline output (March 2026)
 *
 * Run: node supabase/generators/generate_006_module74_revised.mjs
 * Output: supabase/migrations/006_module7_4_revised.sql
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Lesson Definitions ──────────────────────────────────────────

const LESSONS = [

  // ═══════════════════════════════════════════════════════════════
  // PARENT HUB: The Path to True Intimacy
  // ═══════════════════════════════════════════════════════════════
  {
    uuid: '35726e17-6646-40bc-a06f-80720c8fecfb',
    title: 'The Path to True Intimacy',
    estimated_minutes: 5,
    blocks: [
      { type: 'heading', content: 'Healing Hearts and Rekindled Flames: The Path to True Intimacy' },
      { type: 'text', content: 'As we move from Module 7.3: Letting Go to Living Free, we learned to release old hurts, resentments, and patterns that no longer serve us. Now, we step into a space of renewal and deeper connection. Intimacy isn\'t just rebuilt \u2014 it flourishes when we feel truly seen, safe, and free to be ourselves.' },
      { type: 'text', content: 'A note on how to read this module: Jeff and I wrote this together. Jeff\'s sections are written from his perspective as a clinician and husband. My sections are written from my experience as his wife and as someone who has walked the hardest parts of this road. We each had things to say that the other couldn\'t. You\'ll need both voices.' },
      { type: 'text', content: 'We introduced the six levels of intimacy in Module 1.3. In Module 7.4, we build on that foundation with a deeper, more practical exploration \u2014 so that nurturing every level of intimacy becomes intentional and connected, ultimately allowing sexual intimacy to emerge as the natural, joyful cherry on top.' },
      { type: 'divider' },
      { type: 'subheading', content: 'Learning Objectives' },
      { type: 'text', content: 'By the end of this module, you will be able to:' },
      { type: 'list', ordered: true, items: [
        'Identify all six levels of intimacy and articulate which levels feel most connected and most depleted in your relationship right now.',
        'Apply the SPARK Method to at least one difficult intimacy-related conversation during or after this module.',
        'Name the specific emotional Brakes and Accelerators that affect your own desire for sexual intimacy.',
        'Describe what healing from betrayal trauma looks like at the nervous system level, and identify where you currently are in that process.',
        'Complete the Yes/No/Maybe Couples Practice with your spouse and use it to open one new conversation about physical and sexual intimacy.'
      ]},
      { type: 'divider' },
      { type: 'subheading', content: 'What\'s Ahead' },
      { type: 'text', content: 'This module is split into four sections, each building on the last. Take your time with each one and discuss together as you go.' },
      { type: 'list', ordered: true, items: [
        'Foundations & Safety \u2014 Trust, commitment, the SPARK tool, Sliding Door Moments, and healing betrayal trauma.',
        'The Connection Layers \u2014 Verbal, emotional, and intellectual intimacy.',
        'Spiritual & Physical Intimacy \u2014 Shared meaning, safe touch, and the Dual Control Model.',
        'Sexual Connection & Action Plan \u2014 Altruistic pleasure, sacred connection, and your weekly maintenance plan.'
      ]}
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CHILD 1: Foundations & Safety (Parts 1–2)
  // ═══════════════════════════════════════════════════════════════
  {
    uuid: 'eff7805a-53e8-4c18-97ac-d4af9399c790',
    title: 'Foundations & Safety',
    estimated_minutes: 30,
    blocks: [
      // ── Part 1: The Foundation ──
      { type: 'heading', content: 'Part 1: The Foundation \u2014 Psychology of \u201CUs\u201D' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'subheading', content: 'Trust, Commitment, Honesty, and Loyalty' },
      { type: 'text', content: 'Before a couple can connect, they must feel safe. This section establishes the psychological soil in which intimacy grows.' },

      { type: 'subheading', content: 'Trust' },
      { type: 'text', content: 'The consistent knowledge that your partner acts in your best interest. It is built in \u201Csliding door\u201D moments \u2014 choosing to turn toward your partner\'s needs rather than away.' },
      { type: 'callout', icon: 'lightbulb', content: 'Sliding Door Moments is a concept from Dr. John Gottman describing the small, everyday bids for connection that either build or erode trust. They happen in the kitchen, in the car, or while lying in bed. While they seem small, they are where trust is either built or eroded.' },

      { type: 'subheading', content: 'Commitment' },
      { type: 'text', content: 'The decision to stay and work through the messy parts. It is the psychological safety net that allows for true vulnerability.' },

      { type: 'subheading', content: 'Honesty and Loyalty' },
      { type: 'text', content: 'Honesty is the bridge to reality; loyalty is the protection of that bridge. Loyalty means being your partner\'s biggest advocate, especially when they are not present.' },

      { type: 'divider' },
      { type: 'exercise', title: 'Questions to Explore Together', prompt: 'Take your time with these. Use SPARK if the conversation gets activated. These questions are not a checklist \u2014 they are the beginning of a longer conversation.', steps: [
        'What can I do to promote trust between us?',
        'Do you feel I have your back when we are with others? Where can I show up better for you?',
        'Can you help me understand how you feel about my commitment to you?',
        'When the going gets tough, what do you need to feel that we are a team?'
      ]},

      { type: 'divider' },
      { type: 'bold_text', content: 'Trisha' },
      { type: 'text', content: 'I know exactly what it felt like to lose this foundation. Like Steve and Jenny, and so many of you, Jeff and I walked through long, hard seasons where physical intimacy felt worlds away. Between the exhaustion of raising little ones, running the house, and Jeff\'s grueling physician schedule filled with late nights, missed recitals, and weekend calls, we weren\'t a team anymore. We were just two ships passing in the night.' },
      { type: 'text', content: 'The exhaustion was deep. But what we didn\'t understand then were the old survival patterns we were both carrying. Because our childhoods were rough, we didn\'t have a map for healthy love or how to fix things after a fight. We only knew how to survive.' },
      { type: 'text', content: 'What we finally realized is exactly what Jeff said: chemistry follows connection. It\'s built in the tiny, ordinary moments \u2014 the soft tone you use after a long day, a gentle touch as you pass in the hallway, a quiet check-in while you\'re at the grocery store. It grows through eye contact, shared laughter, and choosing to show up, over and over again.' },
      { type: 'callout', icon: 'heart', content: 'Sex isn\'t the foundation of intimacy. It\'s the celebration of it. When emotional safety finally has room to grow, physical desire finally has space to breathe.' },

      // ── Part 2: Healing Betrayal Trauma ──
      { type: 'divider' },
      { type: 'heading', content: 'Part 2: Healing Betrayal Trauma \u2014 The Safe Atmosphere' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'subheading', content: 'Navigating Hurt with Patience and Without Judgment' },
      { type: 'text', content: 'Betrayal comes in many forms. It can be subtle \u2014 making plans to go out with friends on your anniversary. Or it can be a deeply painful betrayal of sexual infidelity. Betrayal does not automatically mean divorce. If you have experienced the life-questioning depth of betrayal yet still feel a desire to save your marriage, begin with these key principles:' },

      { type: 'subheading', content: 'No Deadlines' },
      { type: 'text', content: 'Healing takes as long as it takes. \u201CIt\'s been a year, get over it\u201D is not just unhelpful \u2014 it actively restarts the clock. The nervous system requires consistency over time to reset.' },

      { type: 'subheading', content: 'The Betrayer\'s Burden' },
      { type: 'text', content: 'The partner who caused the hurt must lead with patience. This means answering the same questions with the same gentleness every time they are asked. It means owning what happened without defensive language such as \u201CI\'m sorry I did it, but I wasn\'t feeling heard either\u201D \u2014 statements that shift blame and undermine the apology.' },

      { type: 'subheading', content: 'Healing Over Judging' },
      { type: 'text', content: 'Shift the mindset from \u201CI already said I\'m sorry\u201D to \u201CI am here for your pain.\u201D Creating a safe atmosphere means allowing the betrayed partner to heal on their own timeline. Use the SPARK Method in every difficult conversation. Stay steady. Your role is to be present for their pain \u2014 especially when it is uncomfortable.' },

      { type: 'divider' },
      { type: 'bold_text', content: 'Trisha' },
      { type: 'text', content: 'This section hits very close to home for me. Many years ago, Jeff and I walked this exact, very excruciating road ourselves.' },
      { type: 'text', content: 'The betrayal felt like our entire life had been thrown into a blender. I remember the shock that stopped my breath. The endless questions looping through my mind at 3 AM. I remember thinking, \u201CHow did I get here?\u201D I felt like I was sleeping beside the enemy.' },
      { type: 'text', content: 'I remember D-day \u2014 the day discovery hit. The room spun. My chest tightened like a vise. I couldn\'t stop shaking. My nervous system screamed the brutal double bind: the very person I needed most for safety had suddenly become the very source of my deepest wound imaginable.' },
      { type: 'quote', content: 'I need you for safety... and you are the one who hurt me.', attribution: '' },
      { type: 'text', content: 'That conflict tore through me like a vicious storm. I became hypervigilant. Intrusive thoughts and images flooded my mind. Sleep was nearly impossible. Some moments I felt numb, and other moments waves of emotion would crash over me without warning.' },
      { type: 'text', content: 'Looking back, I can see how my nervous system was desperately trying to find relief. I remember standing in the grocery store one day and suddenly bursting into tears right there in the aisle. For a long time, I thought something was wrong with me. But nothing was wrong with me. Those reactions were not weakness. They were my nervous system\'s intelligent attempt to protect me after a relational tsunami.' },
      { type: 'text', content: 'Healing did not happen quickly, and it was not linear. I wanted it to look like: hurt \u2192 repair \u2192 forgive \u2192 recover \u2192 move on. But the real journey looked more like: stabilize somewhat in the chaos \u2192 get severely activated \u2192 regulate my body \u2192 get activated again \u2192 repair together \u2192 another trigger \u2192 regulate a little faster \u2192 slowly deepen safety over time.' },
      { type: 'text', content: 'Some days felt like progress. Other days felt like sliding backward off a cliff. But over months and years, the triggers came less often, lasted for shorter periods, and slowly lost their power to completely derail me. Along the way I learned something I never expected to learn: it is possible to hold grief and hope in the same body.' },
      { type: 'callout', icon: 'heart', content: 'Trust did not come back because of his promises. Trust returned through patterned safety over time.' },
      { type: 'text', content: 'Triggers still surface on rare occasions. But we have learned something powerful about them: triggers are not setbacks. They are invitations to investigate. When one hits, we slow the moment down. Pause. Regulate. Name what is happening: \u201CThis is a trigger. My nervous system is protecting me from the past.\u201D Then repair together. This turns pain into healing fuel instead of something that controls the relationship.' },
      { type: 'text', content: 'Jeff and I survived the fire \u2014 every layer \u2014 through Christ, honesty, humility, and unwavering commitment to healing over shame. If you are in this kind of pain right now, hold on. You are not alone.' },
      { type: 'callout', icon: 'alert', content: 'If you are in the acute phase of betrayal trauma, this module is a companion to professional support, not a replacement for it. Trisha can help you navigate next steps through a coaching call.' }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CHILD 2: The Connection Layers (Parts 3–5)
  // ═══════════════════════════════════════════════════════════════
  {
    uuid: 'e915a4d3-0c0a-4039-8d8e-0dd2451e22f8',
    title: 'The Connection Layers',
    estimated_minutes: 25,
    blocks: [
      // ── Part 3: Verbal Intimacy ──
      { type: 'heading', content: 'Part 3: Verbal Intimacy \u2014 Beyond \u201CI Love You\u201D' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'text', content: 'Words are the atmosphere of a relationship.' },

      { type: 'subheading', content: 'The Power of Tone' },
      { type: 'text', content: 'Research shows the way you say something matters more than what you say. Aim for a soft startup in every conversation. The SPARK Method can help significantly here.' },

      { type: 'subheading', content: 'Specific Gratitude' },
      { type: 'text', content: 'Move from \u201CThanks\u201D to \u201CI noticed you took the trash out so I wouldn\'t have to, and I felt really cared for.\u201D Specific and sincere gratitude lands differently than a quick acknowledgment.' },

      { type: 'subheading', content: 'Words of Affirmation' },
      { type: 'text', content: 'Identify the character traits you admire in your partner and tell them why you value who they are \u2014 not just what they do. Sincerity matters. An eye-roll during an affirmation undoes the words entirely.' },

      { type: 'divider' },
      { type: 'bold_text', content: 'Trisha' },
      { type: 'text', content: 'While tone has not been my biggest personal struggle, it has certainly been a challenge in our relationship. When Jeff is stressed or tired, his tone can sharpen \u2014 not because he doesn\'t love me, but because his nervous system is running fast. I initially interpreted that sharpness as rejection, when the reality was simply that he was exhausted and activated.' },
      { type: 'text', content: 'What changed everything for us was awareness. Instead of assuming the meaning behind his tone, I had to learn the art of asking curious questions. Jeff has a great saying: \u201CCurious before furious!\u201D Rather than reacting to the sting, I started checking in to see what was really happening beneath the surface. \u201CDid I misunderstand what you just said?\u201D or \u201CIs there something else going on?\u201D \u2014 simple questions that stopped the freeze-or-fawn cycle and invited him back into the room.' },
      { type: 'callout', icon: 'heart', content: 'Words are not small. They shape the atmosphere of a relationship, and the atmosphere you create together will either nurture intimacy or slowly erode it.' },

      { type: 'exercise', title: 'Questions to Explore Together', prompt: 'Take turns answering these honestly. Use SPARK if the conversation gets activated.', steps: [
        'What tone shift in me would make the biggest difference to your sense of safety with me?',
        'What specific thing have I done recently that made you feel seen? What made you feel overlooked?',
        'When I need something from you emotionally, how can I ask in a way that doesn\'t feel like a demand?'
      ]},

      // ── Part 4: Emotional Intimacy ──
      { type: 'divider' },
      { type: 'heading', content: 'Part 4: Emotional Intimacy \u2014 Ending the Mind-Reading' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'callout', icon: 'lightbulb', content: 'We often punish our partners for failing a test they didn\'t know they were taking.' },

      { type: 'subheading', content: 'The End of Mind-Reading' },
      { type: 'text', content: 'Erase from your mind: \u201CWe\'ve been married 15 years \u2014 they should know this about me by now.\u201D Explicitly state your needs. \u201CI am feeling overwhelmed and I need a 10-minute snuggle\u201D works better than being cold and hoping they notice.' },

      { type: 'subheading', content: 'The Vulnerability Cycle' },
      { type: 'text', content: 'When you share a fear, you invite your partner to be your protector. This creates a bond that surface-level facts cannot touch.' },

      { type: 'subheading', content: 'Emotional Safety' },
      { type: 'text', content: 'When your partner shares a raw or dark feeling, hold it like a precious object \u2014 never as a weapon to use later. This is the foundation of true emotional intimacy.' },

      { type: 'divider' },
      { type: 'bold_text', content: 'Trisha \u2014 The Costco Lesson' },
      { type: 'text', content: 'Mind-reading is a silent epidemic in relationships. I used to carry silent expectations and think, \u201CIf Jeff really knew me, he would just know what I need.\u201D One of my biggest lightbulb moments about this happened during a very normal trip to Costco. We had ordered a reprinted family photo, and Jeff ran inside to grab it while I stayed in the car. In my mind, there was a very clear plan: he would pick it up, open the package, carefully inspect it, and return to the car having completed his assignment like a highly trained Costco photo-inspection specialist.' },
      { type: 'text', content: 'All of this was very clear. In my head.' },
      { type: 'text', content: 'So Jeff comes back, gets in the car, and I ask, \u201CSo how does the picture look?\u201D And Jeff says, \u201CI don\'t know.\u201D I said, \u201CWait \u2014 you didn\'t check it before you left the store?\u201D And Jeff just calmly looks over at me and says, \u201CNo. You never asked me to look at it.\u201D' },
      { type: 'text', content: 'I had an entire unspoken plan in my head that I expected him to magically follow, without ever actually telling him. Apparently my communication strategy at the time was to think the instructions really loudly and hope Jeff picked them up through invisible marital telepathy. Shockingly \u2014 that did not work.' },
      { type: 'callout', icon: 'heart', content: 'By cutting through the guesswork of mind-reading and choosing clarity instead, you hand your partner the keys to your heart. Clear communication saves marriages \u2014 and occasionally, unnecessary trips back to Costco.' },

      { type: 'exercise', title: 'Questions to Explore Together', prompt: 'Make sure both partners have the chance to answer.', steps: [
        'Are you feeling stressed about something I might not be aware of?',
        'Is there a moment lately where you felt a disconnect with me but didn\'t feel like you could bring it up?',
        'What is one thing you need from me emotionally that you\'ve been hesitant to ask for?'
      ]},

      // ── Part 5: Cognitive and Intellectual Intimacy ──
      { type: 'divider' },
      { type: 'heading', content: 'Part 5: Cognitive and Intellectual Intimacy \u2014 Shared Curiosity' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'text', content: 'This is the meeting of minds \u2014 respecting and engaging with your partner\'s thoughts, even when they differ from yours.' },

      { type: 'subheading', content: 'Curious Before Furious' },
      { type: 'text', content: 'When your partner does something that confuses or upsets you, your first internal question should be: \u201CWhat am I missing?\u201D rather than \u201CHow could they?\u201D This one-second pivot keeps your CEO Brain in the driver\'s seat instead of your Critter Brain.' },

      { type: 'subheading', content: 'Sharing the Why' },
      { type: 'text', content: 'Don\'t just share what you think \u2014 share why you think it. The difference between positions and interests is the difference between a debate and a conversation.' },

      { type: 'subheading', content: 'The Dreamer Practice' },
      { type: 'text', content: 'Regularly ask about your partner\'s changing dreams and goals. People evolve. Stay curious about who they are becoming today.' },

      { type: 'divider' },
      { type: 'bold_text', content: 'Trisha' },
      { type: 'text', content: 'I like to think of intellectual intimacy as an invitation to tour your partner\'s internal world. When we have been together for a long time, we start to think we\'ve seen every room in their house. But people are not static \u2014 we are constantly shaped by our experiences. Choosing to be curious before furious is like saying, \u201CI value understanding your experience more than proving my assumption right.\u201D You don\'t need to be an expert on your partner. You get to be a student of them.' },

      { type: 'exercise', title: 'Questions to Explore Together', prompt: 'Write down your answers. You will want to return to this another day.', steps: [
        'What is something you are looking forward to that includes us?',
        'What is a topic we keep avoiding that is getting in the way of our intimate relationship?',
        'How do you feel when I try hard to listen and understand without getting angry or defensive?'
      ]}
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CHILD 3: Spiritual & Physical Intimacy (Parts 6–8)
  // ═══════════════════════════════════════════════════════════════
  {
    uuid: '046a4c84-01c7-445f-b72f-f2c7a8dac58c',
    title: 'Spiritual & Physical Intimacy',
    estimated_minutes: 30,
    blocks: [
      // ── Part 6: Spiritual Intimacy ──
      { type: 'heading', content: 'Part 6: Spiritual Intimacy \u2014 Shared Meaning' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'text', content: 'Connecting on a level that transcends the physical and intellectual \u2014 moving from \u201CI\u201D to \u201CWe.\u201D' },
      { type: 'text', content: 'Three scriptures that frame spiritual intimacy in marriage:' },

      { type: 'quote', content: 'That is why a man leaves his father and mother and is united to his wife, and they become one flesh.', attribution: 'Genesis 2:24' },
      { type: 'text', content: 'This oneness (Hebrew: Echad) does not mean losing your identity. It means creating a new, unified entity. A wound to one is a wound to both; a victory for one is a victory for both.' },

      { type: 'quote', content: 'And over all these virtues put on love, which binds them all together in perfect unity.', attribution: 'Colossians 3:14' },
      { type: 'text', content: 'Love is the belt that holds the armor together. Without it, honesty, loyalty, and passion fall apart. It is a choice you put on every morning \u2014 even on the days you don\'t feel \u201Cin love.\u201D' },

      { type: 'quote', content: 'Do two walk together unless they have agreed to do so?', attribution: 'Amos 3:3' },
      { type: 'text', content: 'Unity requires a shared destination. Are we heading toward the same future? What can I do to get back in step with you?' },

      { type: 'divider' },
      { type: 'bold_text', content: 'Trisha' },
      { type: 'text', content: 'Spiritual intimacy has been one of the most grounding forces in our marriage, especially in the seasons when everything felt like it was completely coming apart. There were times when Jeff and I truly did not know how we were going to make it through. We didn\'t have the answers. We didn\'t have the strength. But we knew where to turn.' },
      { type: 'text', content: 'Many nights we knelt together in prayer \u2014 not because everything was okay, but because it wasn\'t. Sometimes the prayers were full of tears. Sometimes the words barely came out at all. And somehow, in those sacred moments, something began to shift. We realized we were not carrying the weight of our marriage alone. Christ carried us in ways we simply could not carry ourselves.' },
      { type: 'text', content: 'When you invite God into your relationship, the entire focus changes. It stops being about winning the argument or proving who is right. It becomes about humility. Forgiveness. Surrendering your pride and asking for help when you simply do not have the strength on your own.' },

      // ── Part 7: Physical Intimacy ──
      { type: 'divider' },
      { type: 'heading', content: 'Part 7: Physical Intimacy \u2014 The Skin-to-Skin Foundation' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'callout', icon: 'heart', content: 'Non-sexual touch tells the nervous system: You are home. You are safe.' },

      { type: 'subheading', content: 'Gentle Proximity' },
      { type: 'text', content: 'Sitting close enough that your shoulders touch; a hand on the small of the back while walking. These are not small gestures \u2014 they are nervous system signals.' },

      { type: 'subheading', content: 'The 20-Second Hug' },
      { type: 'text', content: 'This is the biological reset button. Holding a hug for 20 seconds lowers cortisol and raises oxytocin. The goal is connection, not completion.' },

      { type: 'subheading', content: 'Touch Without the Ask' },
      { type: 'text', content: 'Establish that physical affection does not always have to be a prelude to sex. This removes pressure and allows both partners \u2014 especially a partner healing from betrayal \u2014 to enjoy touch without anxiety.' },

      { type: 'divider' },
      { type: 'bold_text', content: 'Trisha' },
      { type: 'text', content: 'I love this section because it reminds us that intimacy does not begin in the bedroom. It begins in the quiet, ordinary moments of a life together.' },
      { type: 'text', content: 'For a long time my nervous system lived on high alert. My body was constantly scanning for danger, which made it hard to truly relax. What Jeff and I eventually discovered is the powerful science of co-regulation. When we hold hands or sit close, we are not just being sweet. Safe touch releases oxytocin, lowers cortisol, and gently signals to the Critter Brain \u2014 the fear center of the brain \u2014 that it can stand down. Over time, safe touch helps the body begin to associate your partner with comfort again instead of threat.' },
      { type: 'text', content: 'The smallest things mattered the most: a hand on my arm while making dinner, sitting shoulder to shoulder on the porch watching the sunset, a quiet moment together at the end of the day. Those simple moments slowly taught my body it was safe to stop searching for the exit and begin to feel at home again.' },

      { type: 'exercise', title: 'Practices to Try This Week', prompt: 'Choose at least one to practice daily this week.', steps: [
        'The Morning Anchor: Before getting out of bed, spend 30 seconds holding hands or letting your feet touch. It anchors the day in us before the world starts pulling you apart.',
        'The Six-Second Kiss: Dr. Gottman calls this \u201Ca kiss with potential.\u201D Long enough to feel a connection instead of routine.',
        'Safe-Word Silence: If touch begins to feel heavy or activating, create a simple word or gesture that means \u201CI need a moment, but I\'m still here.\u201D This protects the boundary without creating rejection.'
      ]},

      // ── Part 8: Sexual Intimacy I — Dual Control Model ──
      { type: 'divider' },
      { type: 'heading', content: 'Part 8: Sexual Intimacy I \u2014 The Dual Control Model' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'subheading', content: 'Removing the Brakes' },
      { type: 'text', content: 'Understanding how arousal actually works in a long-term relationship requires understanding the Dual Control Model: the idea that sexual desire has both an accelerator (what turns it on) and a brake (what turns it off). Most low-desire situations are actually high-brake situations \u2014 not a lack of love or attraction, but a nervous system that does not yet feel safe enough to open.' },

      { type: 'subheading', content: 'Accelerators' },
      { type: 'text', content: 'Emotional safety, feeling seen and desired, non-demanding touch, time and space, specific words of affirmation.' },

      { type: 'subheading', content: 'Brakes' },
      { type: 'text', content: 'Stress, disconnection, unresolved conflict, feeling unseen, performance anxiety (the fear response that activates the Critter Brain and slams the brakes before desire has a chance to build), unfinished emotional business.' },

      { type: 'subheading', content: 'Mutual Visibility' },
      { type: 'text', content: 'True visibility means understanding where your spouse is in the moment \u2014 reading the room before you begin, and warming up before moving forward.' },

      { type: 'divider' },
      { type: 'bold_text', content: 'Trisha' },
      { type: 'text', content: 'I want to go a little deeper here, because for many of us the brakes are not just about a busy schedule or a messy kitchen. Very often the brakes are rooted in survival. When you\'ve experienced trauma or a deep breach of trust, your body\'s natural response is to protect itself. In our marriage, my brakes were often slammed on because my nervous system simply didn\'t feel the safety it needed to let go.' },
      { type: 'text', content: 'What Jeff calls \u201Cthe brakes,\u201D I experienced as a physical wall. Over time I\'ve learned that understanding our unique brakes and accelerators can be incredibly transformative \u2014 making love is not just about sex. It is about shared vulnerability. It is the science of feeling safe enough to finally drop your guard.' },

      { type: 'exercise', title: 'Practices for Removing the Brakes', prompt: 'These create safe space for honest conversation about desire.', steps: [
        'The Brick Check-In: Once a week, gently ask: \u201CIs there anything feeling like a brick on your brakes right now?\u201D This allows you to address stress or hurt before it quietly builds distance.',
        'Safety Signals: Agree on a way to communicate when the brakes are on without it feeling like rejection: \u201CI really want to be close to you, but my system feels a little crowded right now. I need to find some emotional safety first.\u201D'
      ]}
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // CHILD 4: Sexual Connection & Action Plan (Parts 9–10 + Assessments + Bridge)
  // ═══════════════════════════════════════════════════════════════
  {
    uuid: 'e2e690a6-8604-44f7-bcbd-f15c158269de',
    title: 'Sexual Connection & Action Plan',
    estimated_minutes: 30,
    blocks: [
      // ── Part 9: Sexual Intimacy II ──
      { type: 'heading', content: 'Part 9: Sexual Intimacy II \u2014 Altruistic Pleasure' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'subheading', content: 'Connection, Understanding, and the Afterglow' },
      { type: 'text', content: 'Sex is the cherry on top of the safety built in the previous nine parts.' },

      { type: 'subheading', content: 'Altruistic Pleasure' },
      { type: 'text', content: 'Focus on your partner\'s satisfaction as a gift. When both partners hold this service mindset, the pressure to perform disappears, and pleasure increases.' },

      { type: 'subheading', content: 'Working Together' },
      { type: 'text', content: 'Communicate what feels like love in the moment. Ask questions rather than guessing \u2014 but also read the room. Sometimes asking questions spoils the mood; keep your eyes open and watch how your partner responds.' },

      { type: 'subheading', content: 'Climax' },
      { type: 'text', content: 'Always a great destination, but not always achieved. Be grateful for getting there; offer grace and understanding if not. Sexual intimacy evolves as you continue to know each other.' },

      { type: 'subheading', content: 'The Afterglow' },
      { type: 'text', content: 'The 15 minutes after sexual intimacy are among the most important for bonding. Use this time for cuddling, gentle words, and the Kindle step of the SPARK Method.' },

      { type: 'divider' },
      { type: 'bold_text', content: 'Trisha' },
      { type: 'text', content: 'I love that Jeff calls sex the cherry on top, because for a long time it felt like a distant shore I wasn\'t sure I would ever reach again. After betrayal \u2014 or when your heart has been hurt \u2014 the bedroom can feel like the most vulnerable place on earth.' },
      { type: 'text', content: 'What I eventually discovered is that when emotional safety begins to return, intimacy can become something very different than it once was. It can become a place of rest and reset. Altruistic pleasure is the beautiful mindset of saying, \u201CYour joy matters to me.\u201D It shifts the focus away from performance and back to presence. When your attention turns toward your partner\'s joy, your own nervous system begins to soften. The pressure lifts. The brakes quiet down. What once felt tense or fragile slowly becomes safe again.' },
      { type: 'text', content: 'Those quiet minutes of afterglow are often where the deepest repair happens \u2014 where oxytocin peaks, where nervous systems settle, and where the world finally feels far away. It is a small window of peace where two people can simply rest in the connection they fought so hard to rebuild.' },

      // ── A Word on Pornography ──
      { type: 'divider' },
      { type: 'subheading', content: 'A Word on Pornography' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'text', content: 'Research suggests that habitual pornography use can reduce the brain\'s ability to experience sexual pleasure during real-life intimacy, making marital connection less satisfying over time. It can also create pressure on a spouse\'s personal boundaries and generate harmful comparisons. For these reasons, avoidance is strongly recommended.' },
      { type: 'bold_text', content: 'Trisha' },
      { type: 'text', content: 'What many don\'t realize is that hidden pornography use registers in the body much like infidelity \u2014 it is a form of betrayal trauma. The person you trust most for safety becomes the source of pain. Many spouses describe the impact in raw, simple terms: \u201CHe or she is choosing fantasy over me. Am I not enough?\u201D These reactions are not overreactions. They are the body\'s honest response to a real violation of trust. Yet hope remains. Many couples face this wound \u2014 whether from pornography, infidelity, or other betrayals \u2014 and emerge with marriages that are more honest, compassionate, and deeply connected than before.' },

      // ── Part 10: The Action Plan ──
      { type: 'divider' },
      { type: 'heading', content: 'Part 10: The Action Plan \u2014 Weekly Maintenance' },
      { type: 'bold_text', content: 'Jeff' },
      { type: 'subheading', content: 'Consistency Is the Practice' },
      { type: 'text', content: 'A relationship is not a destination. It is a garden. Here are three weekly practices that keep it growing:' },

      { type: 'subheading', content: 'The Weekly State of the Union' },
      { type: 'text', content: '20 minutes to check in. What went well in our week? Where do we need more SPARK? This is not a conflict session \u2014 it is a connection ritual.' },

      { type: 'subheading', content: 'The Daily Three' },
      { type: 'text', content: 'One word of affirmation. One physical touch. One curious question. A 15-second hug, a six-second kiss, and eye contact. These are not grand gestures \u2014 they are the sliding door moments that build trust over time.' },

      { type: 'subheading', content: 'The Activation Plan' },
      { type: 'text', content: 'Agree together that if a betrayal trigger or activation occurs at any of the six levels of intimacy, the active partner pauses immediately and follows the SPARK steps. Your roles: show up fully, lean in even when it\'s uncomfortable, stay present.' },

      { type: 'exercise', title: 'Questions to Explore Together', prompt: 'These are your ongoing conversation starters \u2014 return to them often.', steps: [
        'What words, actions, or behaviors enhance your desire to connect with me?',
        'What dream in your life have you yet to share with me?',
        'After we are sexually intimate, what is one thing I could say or do that would help you feel more anchored to us?',
        'When things are difficult between us, what gives you the most hope to keep going?',
        'Is there anything I can do to help our intimate experiences together feel more safe and pleasurable for you?'
      ]},

      // ── Self-Assessment ──
      { type: 'divider' },
      { type: 'heading', content: 'Self-Assessment: Your Intimacy Profile' },
      { type: 'subheading', content: 'Reflecting with Honesty, Not Judgment' },

      { type: 'exercise', title: 'Part A: Six Levels of Intimacy \u2014 Current State', prompt: 'Rate each level of intimacy in your relationship right now on a scale of 1 (depleted) to 10 (thriving).', steps: [
        'Physical Intimacy (non-sexual touch, proximity)',
        'Emotional Intimacy (sharing feelings, vulnerability)',
        'Intellectual Intimacy (shared ideas, curiosity)',
        'Spiritual Intimacy (shared meaning, faith, purpose)',
        'Experiential Intimacy (shared activities, memories)',
        'Creative Intimacy (shared creation, problem-solving)'
      ]},

      { type: 'exercise', title: 'Part B: Your Brakes and Accelerators', prompt: 'For each item below, mark whether it currently acts as a Brake (slows your desire for intimacy), an Accelerator (builds it), or is Neutral for you.', steps: [
        'Feeling emotionally connected',
        'Unresolved conflict',
        'Non-demanding physical touch',
        'Stress from work or parenting',
        'Feeling desired and pursued',
        'Performance pressure or expectations',
        'Words of affirmation',
        'Exhaustion or lack of sleep',
        'Intentional time set aside',
        'Feeling unseen or overlooked'
      ]},

      // ── Couples Practice: Yes/No/Maybe ──
      { type: 'divider' },
      { type: 'heading', content: 'Couples Practice: The Yes/No/Maybe Checklist' },
      { type: 'subheading', content: 'A Safe Way to Explore Shared Desires' },
      { type: 'text', content: 'Fill this out separately. Mark [Y] for Yes, [N] for No, or [M] for Maybe (open to exploring with more information). After completing individually, compare lists and focus on your Shared Yes and Maybe items. Use SPARK to discuss anything that feels tender.' },

      { type: 'exercise', title: 'I. The Atmosphere (Accelerators)', prompt: 'Mark each item Y, N, or M:', steps: [
        'Soft music and intentional lighting',
        'Extended afterglow \u2014 cuddling and talking after intimacy',
        'Words of affirmation during intimacy',
        'Long eye contact \u2014 what Trisha calls soul gazing'
      ]},

      { type: 'exercise', title: 'II. Physical Connection (Beyond Sex)', prompt: 'Mark each item Y, N, or M:', steps: [
        'Full-body massage with no expectation of sex',
        'Sitting close or skin-to-skin contact',
        'Foot rubs and hand holding',
        'The 20-second hug before the bedroom'
      ]},

      { type: 'exercise', title: 'III. The Sexual Realm', prompt: 'Mark each item Y, N, or M:', steps: [
        'Trying new locations in the house',
        'Sharing sexual desires and fantasies verbally',
        'Slow, sensual intimacy',
        'Spontaneous intimacy versus scheduled intimate dates'
      ]},

      { type: 'exercise', title: 'IV. Emotional Safety (Addressing the Brakes)', prompt: 'Mark each item Y, N, or M:', steps: [
        'Ability to pause or stop at any time without guilt or consequence',
        'Regular check-ins: \u201CHow does this feel for you?\u201D',
        'Using the SPARK Method if a trigger or activation occurs',
        'Discussing sexual needs and desires outside the bedroom \u2014 separate from the moment itself'
      ]},

      // ── Reflection Prompts ──
      { type: 'divider' },
      { type: 'heading', content: 'Reflection Prompts' },
      { type: 'exercise', title: 'Individual Reflection', prompt: 'Take time with these on your own before sharing.', steps: [
        'Looking at your Intimacy Profile scores, which level surprised you most \u2014 either higher or lower than you expected? What does that tell you about what your relationship needs right now?',
        'Trisha describes healing from betrayal as non-linear \u2014 moving forward and backward over time. Where would you place yourself on that arc right now? What would \u201Cone step forward\u201D look like for you this week?',
        'What is one Brake that you have never fully named out loud to your spouse? What has kept you from naming it?'
      ]},

      { type: 'exercise', title: 'Couples Reflection', prompt: 'Do this together after completing the Yes/No/Maybe Checklist.', steps: [
        'After sharing your Yes/No/Maybe lists, what one Shared Yes surprised you? What did you learn about your partner that you didn\'t already know?'
      ]},

      // ── Key Takeaways ──
      { type: 'divider' },
      { type: 'heading', content: 'Key Takeaways' },
      { type: 'list', ordered: true, items: [
        'Intimacy is not a single destination \u2014 it is a full landscape with six distinct dimensions. Sexual intimacy is the cherry on top, not the foundation. When the other five levels are tended consistently, physical and sexual desire grow naturally.',
        'Betrayal trauma is a nervous system wound. It heals through patterned safety over time \u2014 not promises, not timelines, not pressure. The Critter Brain must learn, slowly and repeatedly, that the threat has passed.',
        'Your brakes matter as much as your accelerators. Most low-desire situations are high-brake situations. Naming your brakes \u2014 to yourself and to your spouse \u2014 is one of the most intimate acts of trust in a marriage.',
        'Emotional safety is the prerequisite for physical and sexual safety. You cannot rush the body\'s timeline. But you can build the conditions for it to soften.',
        'Jeff and Trisha\'s story is proof: you are not rebuilding what was. You are building something entirely new \u2014 with stronger wiring, a firmer foundation, and a level of emotional honesty you have never had before.'
      ]},

      // ── Bridge Forward ──
      { type: 'divider' },
      { type: 'heading', content: 'Bridge Forward' },
      { type: 'bold_text', content: 'Trisha \u2014 A Final Note from My Heart to Yours' },
      { type: 'text', content: 'As you move through the layers of intimacy, take a deep breath and acknowledge how far you\'ve come. Whether you are standing on a beautiful summit of connection or still navigating the heavy smoke of the healing fire, please hear this: your heart is capable of incredible restoration.' },
      { type: 'text', content: 'Jeff and I are proof that betrayal doesn\'t have to be the end. It can be the messy middle of a version of us that has completely transformed who we have become. You are no longer just surviving \u2014 you are actively forging a bond rooted in truth, protected by safety, and celebrated through joy.' },
      { type: 'text', content: 'My parting guidance is this: be relentlessly kind to yourself and to each other. Connection is not a destination you reach and then stop. It is a garden you tend every single day. Some days you will plant seeds; some days you will simply pull weeds. Both are sacred work.' },
      { type: 'text', content: 'Hold onto each other and trust the process. Even the smallest step toward emotional safety is a massive victory. You are reclaiming the peace of being fully known and fully loved. There is no obstacle too great to overcome when you do it together.' },
      { type: 'quote', content: 'With love and hope for your continued journey', attribution: 'Trisha' },
      { type: 'callout', icon: 'book', content: 'In Module 8.1, we begin the work of building a new normal \u2014 establishing the daily rhythms, rituals, and practices that sustain the intimacy you have rebuilt here. The garden metaphor continues: Module 7 was about clearing the ground. Module 8 is about learning what to plant.' }
    ]
  }
];

// ─── SQL Generator ───────────────────────────────────────────────

function generateSQL(lessons) {
  const header = `-- =====================================================
-- Migration 006: Module 7.4 - Revised Content (7-Agent Pipeline)
-- Updates content_json for 5 existing lessons (UUIDs preserved)
-- Source: Module_7_4_Revised.docx (Pipeline output March 2026)
-- Run in Supabase SQL Editor
-- =====================================================

BEGIN;

`;

  let body = '';
  for (const lesson of lessons) {
    const contentJson = {
      estimated_minutes: lesson.estimated_minutes,
      blocks: lesson.blocks
    };
    const jsonStr = JSON.stringify(contentJson);
    const escaped = jsonStr.replace(/'/g, "''");

    body += `-- ${lesson.title} (${lesson.blocks.length} blocks, ${lesson.estimated_minutes} min)\n`;
    body += `UPDATE lessons\n`;
    body += `SET content_json = '${escaped}'::jsonb\n`;
    body += `WHERE id = '${lesson.uuid}';\n\n`;
  }

  const verification = `-- Verification: check block counts and minutes
SELECT title,
       content_json->>'estimated_minutes' AS minutes,
       jsonb_array_length(content_json->'blocks') AS block_count
FROM lessons
WHERE id IN (
  '35726e17-6646-40bc-a06f-80720c8fecfb',
  'eff7805a-53e8-4c18-97ac-d4af9399c790',
  'e915a4d3-0c0a-4039-8d8e-0dd2451e22f8',
  '046a4c84-01c7-445f-b72f-f2c7a8dac58c',
  'e2e690a6-8604-44f7-bcbd-f15c158269de'
)
ORDER BY sort_order;

COMMIT;
`;

  return header + body + verification;
}

// ─── Run ─────────────────────────────────────────────────────────

const sql = generateSQL(LESSONS);
const outPath = join(__dirname, '..', 'migrations', '006_module7_4_revised.sql');
writeFileSync(outPath, sql, 'utf-8');

// Summary
const totalBlocks = LESSONS.reduce((sum, l) => sum + l.blocks.length, 0);
const totalMinutes = LESSONS.reduce((sum, l) => sum + l.estimated_minutes, 0);
console.log(`Generated: 006_module7_4_revised.sql`);
console.log(`  Lessons: ${LESSONS.length}`);
console.log(`  Total blocks: ${totalBlocks}`);
console.log(`  Total minutes: ${totalMinutes}`);
for (const l of LESSONS) {
  console.log(`  - ${l.title}: ${l.blocks.length} blocks, ${l.estimated_minutes} min`);
}
