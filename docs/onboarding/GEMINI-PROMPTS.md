# Gemini Prompt Kit for Desirae

> Ready-to-use prompts you can copy and paste into Gemini. Just highlight the text, copy it, and paste it into the Gemini chat panel.
>
> **Tip:** You can customize any prompt by replacing the words in [brackets] with your own details.

---

## Getting Oriented

Use these when you're first exploring or need to understand something.

### "What is this project?"
```
What is this project? Give me a simple overview of what this website does and how it's organized.
```

### "What does this file do?"
```
What does [filename] do? Explain it in simple terms.
```
Example: `What does src/pages/FAQ.jsx do? Explain it in simple terms.`

### "Show me around"
```
I'm new to this project. Show me the most important files and folders I should know about.
```

### "Where is the [page name] page?"
```
Which file controls the [About] page? Where would I find the text that shows up on that page?
```

### "What pages does this website have?"
```
List all the pages on this website with their file names and URLs.
```

---

## Making Changes

Use these when you want to edit content on the site.

### Change text on a page
```
In [src/pages/Home.jsx], change the text "[old text]" to "[new text]".
```
Example: `In src/pages/Home.jsx, change the text "Your marriage isn't broken" to "Your relationship can heal".`

### Update a tagline or heading
```
Find the main heading on the [About] page and change it to "[new heading text]".
```

### Add a new FAQ question
```
Add a new FAQ question to the FAQ page. The question is "[your question]" and the answer is "[your answer]".
```

### Add a new testimonial
```
Add a new testimonial to the Testimonials page. The person's name is "[name]", and their quote is "[quote text]".
```

### Change an image
```
On the [About] page, replace the current image with this URL: [paste image URL here]
```

### Add a local image
```
I put an image called [photo.jpg] in the public folder. Show me how to use it on the [Contact] page.
```

### Change a color
```
Change the [accent] color to [#8B5CF6]. Show me what to edit in tailwind.config.js.
```

### Update the footer
```
In the footer, change the email address to [newemail@example.com].
```

### Update contact information
```
On the Contact page, update the phone number to [new number] and the email to [new email].
```

### Change a button's text
```
On the [Home] page, find the button that says "[old text]" and change it to "[new text]".
```

---

## When Something Breaks

Use these when you see errors or something doesn't look right.

### Red error text in the terminal
```
I'm seeing this error in my terminal. What does it mean and how do I fix it?

[paste the error text here]
```

### My changes aren't showing up
```
I edited [filename] and saved it, but the browser isn't showing my changes. What should I check?
```

### The page looks broken
```
The [page name] page looks broken — things are overlapping or out of place. I was editing [filename]. Can you help me find what went wrong?
```

### The server won't start
```
When I run "npm run dev" I get an error. Here's what it says:

[paste the error text here]
```

### I accidentally deleted something
```
I think I accidentally deleted some code in [filename]. Can you help me figure out what's missing? Here's what the file looks like now.
```

### Everything looks weird after git pull
```
I ran "git pull" and now things look different or broken. What happened and what should I do?
```

---

## Git Help

Use these for saving your work and collaborating.

### Save my work
```
Walk me through saving my current changes to GitHub step by step.
```

### Get the latest version
```
How do I download the latest changes from GitHub before I start working?
```

### What did I change?
```
Show me what files I've changed since my last save. What does "git status" mean?
```

### I got a Git error
```
I tried to push my changes and got this error. What does it mean?

[paste the error here]
```

### What does this Git message mean?
```
Git is showing me this message and I don't understand it:

[paste the message here]
```

### Undo my last commit (before pushing)
```
I just committed something but haven't pushed yet. How do I undo it safely?
```

---

## Understanding Code

Use these when you want to learn what something means.

### "What does this mean?"
```
I'm looking at this code and don't understand it. Can you explain what each part does in simple terms?

[paste the code snippet here]
```

### "What is JSX?"
```
What is JSX? I see it everywhere in this project. Explain it like I've never coded before.
```

### "What are CSS classes?"
```
What are CSS classes? I see things like "text-primary" and "bg-accent" — what do those mean?
```

### "What does this Tailwind class do?"
```
What does the CSS class "[text-foreground/70]" do? Break it down for me.
```

### "What is a component?"
```
What is a "component" in React? I keep seeing that word. Explain it simply.
```

### "What are these curly braces for?"
```
In JSX, I see curly braces {} around some text. What do they do? When are they needed?
```

---

## Safety Check

Use these to verify before making changes.

### Is this file safe to edit?
```
Is [filename] in my safe editing zone? Can I change things in this file without breaking the website?
```

### Review my changes before I save
```
I made some changes to [filename]. Can you review what I changed and tell me if anything looks risky or incorrect before I save to GitHub?
```

### What will this change affect?
```
If I change [describe the change], what other parts of the website might be affected?
```

### Double-check my commit
```
I'm about to save my work with Git. Can you review what files I've changed and make sure nothing looks wrong? Run "git status" and "git diff" for me.
```

### Am I in the right file?
```
I want to change the [description of what you're looking for]. Am I in the right file? The file I have open is [filename].
```

---

## Bonus: Productivity Prompts

### Find text across the whole project
```
Search the entire project for the text "[search term]" and tell me which files contain it.
```

### Show me examples of how [pattern] is used
```
Show me examples of how [testimonials / FAQ items / nav links] are structured in this project so I can add a new one following the same pattern.
```

### Summarize what I changed today
```
Look at my recent changes (git diff) and give me a summary I can use as my commit message.
```

### Create a commit message for me
```
Based on my current changes, suggest a good commit message.
```

---

> **Remember:** Gemini has read the GEMINI.md file in this project, so it knows you're a beginner and will use simple language. If an answer is still confusing, just say "Explain that more simply" or "Give me the step-by-step version."
