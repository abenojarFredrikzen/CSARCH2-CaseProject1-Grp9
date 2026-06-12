# CSARCH2 Virtual Exhibit Case Proposal

## Revision Highlights

This README contains the revised proposal for **Group 9: Adeos**. The revision addresses the proposal feedback to include more concept discussion in addition to the interactive element.

**Feedback addressed:**

> "Include also some concept discussion besides the interactive element."

**Changes made:**

- Added a **Concept Discussion** section explaining NAND flash organization and basic storage behavior.
- Clarified the use of **Single-Level Cells (SLC)** and **Triple-Level Cells (TLC)**.
- Corrected wording such as **SATA SSD**, **NAND**, **Single-Level Cell**, and **Triple-Level Cell**.
- Expanded and Added more details to the style guide snapshot with colors, fonts, typography examples, diagram/icon style, and visual effects.
- Kept the exhibit interactive through clickable components, hover/tap information panels, zoom-in transitions, SLC/TLC toggles, Write/Erase actions, and an output display.

**Feedback attachment:** [Proposal feedback screenshot](docs/feedback/proposal-feedback.png)  
**Full Original proposal:** [Initial proposal DOCX](docs/proposals/initial-proposal.docx)  
**Full Revised proposal:** [Revised proposal DOCX](docs/proposals/revised-proposal.docx)

---

## Group Information

**Group Title:** Adeos  
**Group Number:** 9  
**Course:** CSARCH2  
**Topic Theme:** Flash memory: How SSDs store data

## Group Members

- Abenojar, Fredrikzen
- Dollentas, Raine Anne
- Encisco, Gabriel Jeremy
- Obregon, Sian Ysabelle
- Singson, Keith Railey

---

## Topic Theme

This virtual exhibit explains how Solid-State Drives, or SSDs, store data using NAND flash memory. Instead of using spinning disks or moving parts, SSDs store information inside flash memory cells through electrical charge. The exhibit will focus on how a flash memory cell can represent binary data, how groups of cells form pages and blocks, and how this allows SSDs to store files electronically.

The main goal of the exhibit is to help visitors understand that digital data is stored as 0s and 1s, and that SSDs preserve those values using flash memory cells. Through a simplified interactive NAND flash simulator, visitors will be able to write binary data into memory cells and see how charged and uncharged states can represent stored information.

---

## Tech Stack Plan

### Exhibit Overview

Our exhibit will focus primarily on how SSDs store data through NAND flash memory, showcasing the tiny scale and sheer number of components that make up SSDs.

There will be three parts to the exhibit. The first part will show SATA and NVMe SSDs with their NAND flash chips highlighted. Clicking a NAND flash chip will bring the visitor to the second part of the exhibit, which will show a simplified version of the chip's internal components: a die with planes, blocks, and pages.

The main part of the exhibit will cover the individual components that store data: **Single-Level Cells (SLC)** and **Triple-Level Cells (TLC)**, which store 1 bit and 3 bits per cell respectively. Both will be shown because Single-Level Cells are easier to understand, while Triple-Level Cells are commonly used in modern NAND flash memory. The exhibit will showcase simplified interactive versions of both SLC and TLC, along with an output screen that users can experiment with.

---

## Proposed Interactive Element

The exhibit will begin by showing viewers a **SATA SSD** and an **NVMe SSD**, both with visible NAND flash memory chips highlighted to emphasize interactivity. Users will be able to click on any of the NAND flash memory chips. Regardless of which chip the user clicks, the user will be brought to a simplified zoomed-in scene of a die with planes, blocks, and pages.

Each component of the NAND flash chip will be interactive. Hovering over a component will show information about it in a tab next to the scene. Clicking on a page will play a zoom-in transition showing that each page is made of thousands of cells. After the transition, the viewer enters another scene showing three cells in series, including parts of each individual cell such as the control gate, source and drain, oxide layer, and TLC or SLC storage behavior.

Each component in the cell scene will also display information when hovered over. On the top-left of this scene, there will be a toggle that allows users to switch between TLC and SLC views.

The viewer will act as the SSD's controller. The control gates of each cell will have two clickable instructions: **Write** and **Erase**. The **Write** instruction will increase the charge by adding electrons to the gate, while **Erase** will return the gate to a zero state. The part of the gate where electrons transfer will increase in brightness whenever an instruction is pressed. Depending on the charge state of the cells, an output screen next to the scene will display the value stored in the cells. The current charge state of the cell being hovered over or selected will also be displayed.

---

## Concept Discussion

SSDs store their data in NAND flash memory chips, which are made of multiple stacked grids of individual NAND memory cells. NAND flash memory cells are arranged in a hierarchy that includes strings, word lines, pages, blocks, planes, dies, and chips. In a simplified view, pages are the smallest addressable units for read and write operations, while blocks are larger groups of pages and are the smallest units that can be erased at once.

NAND flash cells usually store 1 to 3 bits of information, although some versions can store more. Each NAND flash cell stores information by holding electrons in a floating gate. The amount of charge stored in the cell affects how the SSD interprets the value of that cell. A reference voltage can be used to help determine the stored value during a read operation.

A NAND flash cell can also write and erase data. Write and erase instructions are sent through the control gate using certain voltages. A write operation adds electrons to the floating gate, while an erase operation removes electrons and resets the cell. This concept discussion prepares visitors for the interactive part of the exhibit, where they can explore how charge states represent stored data in simplified SLC and TLC cells.

---

## Mobile-Responsive Layout

The exhibit will be designed to work on desktop, tablet, and mobile screens. On desktop, the interactive scene and information panel will be displayed side by side. This allows users to explore SSD components while reading short explanations at the same time.

On smaller screens, the layout will shift into a vertical format. The interactive scene will appear first, followed by the controls, output screen, and explanation panel. Since mobile devices do not use hover, hover interactions will be replaced with tap-based selection. When users tap an SSD part, NAND chip, page, block, or memory cell, the selected component will stay highlighted and its information will remain visible even after the user lifts their finger. When the user taps another component, the information panel will update to show the newly selected part. If the user taps outside the interactive area or selects a close button, the information panel may disappear or reset.

The exhibit will not rely on long-press interactions because they may be less intuitive for visitors. Simple taps will be used for selecting components, switching between SLC and TLC views, and interacting with the memory cells. When users play with the cells, the output screen and information panel will show the current cell state, instruction, and stored value.

The mobile layout will use larger buttons, responsive diagrams, simplified labels, and stacked information cards. The SLC/TLC toggle, Write and Erase buttons, and output screen will also resize for easier touch interaction.

---

## Tentative Style Guide Snapshot

### Theme

**Minimalist Cyberpunk**

The exhibit will use a clean futuristic interface with dark backgrounds, glowing highlights, and circuit-inspired visual elements. The style is intended to match the SSD and NAND flash memory topic while keeping the exhibit readable and beginner-friendly.

### Color Palette

![Cyberpunk color palette](docs/assets/cyberpunk-color-palette.png)

The exhibit will use a dark color scheme consisting of black, dark blue, and gray backgrounds accented with neon cyan, blue, and purple highlights. These accent colors will emphasize interactive components such as SSD parts, NAND flash chips, memory cells, control buttons, and output displays.

**Example usage:**

| UI Element | Color Direction |
| --- | --- |
| Background | Near black / dark navy |
| Main text | White or light gray |
| Primary accent | Cyan / electric blue |
| Secondary accent | Purple |
| Active cell highlight | Neon green or cyan glow |
| Inactive cell | Dark gray or muted blue |
| Warning or note | Amber |

### Font

| Element | Font |
| --- | --- |
| Heading | Tomorrow |
| Links | Disket Mono |
| Body | Space Mono |

### Typography

| Element | Style Rule | Example |
| --- | --- | --- |
| Heading (`h1`) | `font-family: "Tomorrow"; font-size: 200%; text-align: center;` | ![Heading example](docs/assets/typography-heading.png) |
| Link (`a`) | `font-family: "Disket Mono"; font-size: 150%; text-align: center;` | ![Link example](docs/assets/typography-link.png) |
| Body text (`p`, `span`) | `font-family: "Space Mono"; font-size: 80%; text-align: center;` | ![Body text example](docs/assets/typography-body.png) |

### Visual Sample of Home Page

![Visual sample of home page](docs/assets/visual-sample-homepage.png)

### Layout Style

The exhibit will use a card-based layout with clear sections. Each major part of the exhibit will be placed inside a visually distinct section or panel.

- Rounded information cards
- Interactive diagram panels
- Component explanation boxes
- Toggle controls
- Output screen panel
- Step-by-step navigation buttons
- Short callout boxes for important concepts

The layout will avoid long walls of text. Instead, explanations will be broken into short, focused sections that appear when the user interacts with components.

### Diagram and Icon Style

Adeos' exhibit will mainly use geometric shapes for dies, planes, blocks, and pages instead of realistic illustrations. SSDs, NAND chips, and cells will be represented using clean outlines, grid highlights, and labeled sections. Icons and labels will remain visually minimal so the exhibit does not overwhelm users while still maintaining the cyberpunk theme.

### Visual Effects

Selected, active, and clickable components will mainly use glow effects. Hover states and tap states may use neon outlines, brightness changes, or shadows to show interactivity. Simple zoom transitions, highlighting effects, and brightness-change animations will be subtle to avoid excessive movement that could distract from the learning experience.

### Proposed Exhibit Layout

This layout moves from larger SSD components to smaller internal structures:

```text
Hero Section (Landing Page; Shows the SSD)
↓
Introduction: What Is an SSD?
↓
Interactive Scene 1: Click a NAND Flash Chip
↓
Interactive Scene 2: Explore Die, Planes, Blocks, and Pages
↓
Transition: Zoom Into a Page Containing Cells
↓
Interactive Scene 3: Explore Single-Level and Triple-Level Cells
```

---

## References

- Prasad, A. (2026, February 7). *Flash Memory Explained: NAND vs NOR, Architecture, and Memory Organization*. DEV Community. https://dev.to/amanprasad/flash-memory-explained-nand-vs-nor-architecture-and-memory-organization-3abf#memory-organization-sector-block-and-page
- Ele. (2025, March 18). *How does NAND reading work?* Electrical Engineering Stack Exchange. https://electronics.stackexchange.com/questions/336586/how-does-nand-reading-work
- *NAND configuration possibilities: The challenges of NAND die stacking and the role of ATP AcuCurrent technology in ensuring SIGn.* (2025, May 5). Retrieved June 12, 2026, from https://www.atpinc.com/blog/what-is-nand-die-stacking