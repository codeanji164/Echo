/* ==========================================================================
   PROJECT ECHO — Story Progression System
   --------------------------------------------------------------------------
   Scope of this file (intentionally limited):
     - Store story content in a clean, extensible data structure.
     - Render one story block at a time inside #story-display.
     - Advance through blocks using the #continue-button.
     - Stop cleanly at the end of the Hospital Introduction scene.
     - Store evidence content in a clean, extensible data structure.
     - Open/close the evidence panel and let the player browse evidence.

   Explicitly OUT of scope for this file (to be built later):
     - Part 2 / Part 3 evidence
     - Audio
     - Save system (localStorage)
     - Answer / case submission checking

   NOTE: Memory retention percentage logic and action-based evidence
   unlocking are now implemented (see Section 11). Evidence unlocks
   linearly as the player opens each item — no real-world time is
   involved. They plug into the existing evidence system through
   evidenceState.unlockedEvidenceIds without altering how evidence is
   rendered or browsed.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. STORY DATA
   --------------------------------------------------------------------------
   The story is organised into "scenes". Each scene is an ordered array of
   "blocks". A block is the smallest unit of content shown per Continue
   click — this can be a single line of dialogue/narration, or a small
   group of lines that belong together (e.g. a scene heading).

   Adding more content later is as simple as adding new blocks to an
   existing scene, or adding a new scene object below.
   -------------------------------------------------------------------------- */

const storyData = {
  // Scene 1: Hospital Introduction (Story Bible, Part 1, 12:00 PM)
  hospitalIntroduction: [
    {
      lines: [
        "Ashwood General Hospital",
        "Date: 22 August 2026",
        "Time: 12:00 PM"
      ]
    },
    { lines: ["\u201c...\u201d"] },
    { lines: ["The sound of a heart monitor echoes through the room."] },
    { lines: ["Your vision slowly returns. Everything is blurry. The ceiling lights feel unusually bright."] },
    { lines: ["Your head throbs."] },
    { lines: ["A nurse notices your eyes opening."] },
    { lines: ["\u201cDoctor! She's awake!\u201d"] },
    { lines: ["A doctor rushes inside, followed by two police officers."] },
    { lines: ["The doctor shines a flashlight into your eyes."] },
    { lines: ["\u201cDetective Smoochkin... can you hear me?\u201d"] },
    { lines: ["..."] },
    { lines: ["\u201cCan you tell me your name?\u201d"] },
    { lines: ["..."] },
    { lines: ["\u201cDo you know where you are?\u201d"] },
    { lines: ["..."] },
    { lines: ["The doctor quietly turns toward the officers."] },
    { lines: ["\u201cRetrograde memory loss... exactly as expected.\u201d"] },
    { lines: ["One officer steps forward."] },
    { lines: ["He places a thick brown investigation folder on the bedside table."] },
    { lines: ["\u201cDetective Smoochkin.\u201d"] },
    { lines: ["\u201cThirty-two days ago, you and Officer Anji were found inside Room 1801 of the Ashwood Grand Hotel.\u201d"] },
    { lines: ["\u201cThe hotel caught fire.\u201d"] },
    { lines: ["\u201cOfficer Anji did not survive.\u201d"] },
    { lines: ["\u201cYou were found unconscious beneath a collapsed wardrobe on the room balcony.\u201d"] },
    { lines: ["\u201cYou have been in a coma ever since.\u201d"] },
    { lines: ["He pauses."] },
    { lines: ["\u201cYour memories of that night appear to be missing.\u201d"] },
    { lines: ["Another officer slides a tablet toward you."] },
    {
      lines: [
        "On its screen:",
        "PROJECT ECHO"
      ]
    },
    { lines: ["The officer continues."] },
    { lines: ["\u201cProject ECHO is an experimental police investigation program.\u201d"] },
    { lines: ["\u201cIt allows officers suffering from memory loss to reconstruct past events using official evidence.\u201d"] },
    { lines: ["\u201cNothing presented to you has been altered.\u201d"] },
    { lines: ["\u201cEvery report is authentic.\u201d"] },
    { lines: ["\u201cEvery statement is genuine.\u201d"] },
    { lines: ["\u201cYour memories will gradually recover throughout the day.\u201d"] },
    { lines: ["\u201cYour task is simple.\u201d"] },
    { lines: ["He looks directly at you."] },
    { lines: ["\u201cFind out who killed Officer Anji.\u201d"] }
  ]

  // Future scenes (e.g. evidenceIntake, part2, part3, ...) can be added
  // here later without changing the rendering logic below.
};

/* --------------------------------------------------------------------------
   2. STORY STATE
   --------------------------------------------------------------------------
   Tracks which scene and which block within that scene is currently shown.
   For now, only one scene is active: the Hospital Introduction.
   -------------------------------------------------------------------------- */

const storyState = {
  activeScene: "hospitalIntroduction",
  blockIndex: 0
};

/* --------------------------------------------------------------------------
   3. DOM REFERENCES
   -------------------------------------------------------------------------- */

const storyDisplay = document.getElementById("story-display");
const continueButton = document.getElementById("continue-button");

const evidenceButton = document.getElementById("evidence-button");
const evidencePanel = document.getElementById("evidence-panel");
const evidenceList = document.getElementById("evidence-list");
const evidenceCloseButton = document.getElementById("evidence-close-button");

// Memory retention bar elements. These are assumed to already exist in the
// HTML (per the task brief: "update the existing memory retention bar").
// If your actual element ids differ, update the two lines below only —
// nothing else in Section 11 needs to change.
const memoryBarFill = document.getElementById("memory-bar-fill");
const memoryBarLabel = document.getElementById("memory-bar-label");

/* --------------------------------------------------------------------------
   4. RENDERING (STORY)
   -------------------------------------------------------------------------- */

/**
 * Returns the array of blocks for the currently active scene.
 */
function getActiveSceneBlocks() {
  return storyData[storyState.activeScene];
}

/**
 * Renders the block at the current blockIndex into #story-display.
 * Each line in the block becomes its own paragraph.
 */
function renderCurrentBlock() {
  const blocks = getActiveSceneBlocks();
  const currentBlock = blocks[storyState.blockIndex];

  // Clear any previously displayed block.
  storyDisplay.innerHTML = "";

  // Add each line of the block as its own paragraph.
  currentBlock.lines.forEach((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    storyDisplay.appendChild(paragraph);
  });
}

/**
 * Disables the Continue button once the scene has no further blocks.
 * This satisfies the requirement to stop after the Hospital Introduction
 * without moving into evidence, memory sync, or any later system.
 */
function stopStoryProgression() {
  continueButton.disabled = true;
  continueButton.textContent = "End of Introduction";
}

/* --------------------------------------------------------------------------
   5. INTERACTION (STORY)
   -------------------------------------------------------------------------- */

/**
 * Advances to the next block in the active scene, if one exists.
 * If the current block is the last one in the scene, story progression
 * stops instead of moving into the next system.
 */
function handleContinueClick() {
  const blocks = getActiveSceneBlocks();
  const isLastBlock = storyState.blockIndex >= blocks.length - 1;

  if (isLastBlock) {
    stopStoryProgression();
    return;
  }

  storyState.blockIndex += 1;
  renderCurrentBlock();

  // If the block we just moved to is the last one, lock the button
  // right after it renders so the final line stays readable.
  const nowLastBlock = storyState.blockIndex >= blocks.length - 1;
  if (nowLastBlock) {
    // Intentionally left as-is: the user should still be able to press
    // Continue once more to confirm they've reached the end, at which
    // point stopStoryProgression() disables further advancement.
  }
}

continueButton.addEventListener("click", handleContinueClick);

/* ==========================================================================
   6. EVIDENCE DATA
   --------------------------------------------------------------------------
   Evidence is organised the same way story content is: grouped by "part"
   (part1, part2, part3, ...). Each part is an array of evidence objects.
   Each evidence object contains ONLY id, title, and content — no unlock
   logic, timing, or metadata lives on the object itself.

   This keeps the data fully decoupled from how/when it becomes available,
   so later systems (Memory Synchronization, time-based unlocking) can be
   layered on top without touching this structure.
   ========================================================================== */

const evidenceData = {
  part1: [
    {
      id: "fire_department_report",
      title: "Fire Department Report",
      content:
        "ASHWOOD CITY FIRE DEPARTMENT\n\n" +
        "INCIDENT NUMBER\nAFD-210726-031\n\n" +
        "LOCATION\nAshwood Grand Hotel\n\n" +
        "ROOM\n1801\n\n" +
        "DATE\n21 July 2026\n\n" +
        "FIRE ALARM ACTIVATED\n02:58 AM\n\n" +
        "EMERGENCY CALL RECEIVED\n03:02 AM\n\n" +
        "FIRST FIRE ENGINE ARRIVAL\n03:11 AM\n\n" +
        "ESTIMATED FIRE START\n03:00 AM\n\n" +
        "INITIAL FIRE ORIGIN\nDesk\n\n" +
        "CASUALTIES\nOfficer Anji\nStatus:\nDeceased\n\n" +
        "Detective Smoochkin\nStatus:\nCritical\nTransferred to Ashwood General Hospital\n\n" +
        "PROPERTY DAMAGE\nSevere structural damage to first floor.\nPartial collapse.\nMultiple civilian casualties.\n\n" +
        "Report Closed."
    },
    {
      id: "crime_scene_inventory",
      title: "Crime Scene Inventory",
      content:
        "CRIME SCENE INVENTORY\n\n" +
        "Recovered from Room 1801.\n\n" +
        "Items Recovered\n" +
        "White ceramic coffee mug\n" +
        "Wooden desk\n" +
        "Metal reading lamp\n" +
        "Burnt office chair\n" +
        "Burnt paper documents\n" +
        "Steel room key\n" +
        "Curtain fragments\n" +
        "Officer Anji's police badge\n\n" +
        "Inventory Complete."
    },
    {
      id: "firefighter_interview_ethan_brooks",
      title: "Firefighter Interview 01 — Ethan Brooks",
      content:
        "FIREFIGHTER INTERVIEW 01\n\n" +
        "Name:\nEthan Brooks\nFire Unit 4\n\n" +
        "Statement\n" +
        "\"When we entered the first floor, the hallway was already filled with smoke.\"\n\n" +
        "\"I remember seeing flames.\"\n\n" +
        "\"I don't remember seeing any desk.\"\n\n" +
        "End Statement."
    },
    {
      id: "firefighter_interview_samuel_ross",
      title: "Firefighter Interview 02 — Samuel Ross",
      content:
        "FIREFIGHTER INTERVIEW 02\n\n" +
        "Name:\nSamuel Ross\nFire Unit 2\n\n" +
        "Statement\n" +
        "\"The desk was one of the first objects we extinguished.\"\n\n" +
        "\"The flames around it were intense.\"\n\n" +
        "End Statement."
    },
    {
      id: "firefighter_interview_olivia_carter",
      title: "Firefighter Interview 03 — Olivia Carter",
      content:
        "FIREFIGHTER INTERVIEW 03\n\n" +
        "Name:\nOlivia Carter\nFire Unit 1\n\n" +
        "Statement\n" +
        "\"I remember a desk.\"\n\n" +
        "\"It wasn't at reception.\"\n\n" +
        "\"It was close to the staircase.\"\n\n" +
        "End Statement."
    },
    {
      id: "hotel_information",
      title: "Ashwood Grand Hotel — General Information",
      content:
        "ASHWOOD GRAND HOTEL\nGENERAL INFORMATION\n\n" +
        "Building Floors\n3\n\n" +
        "Incident Room\n1801\nFirst Floor\n\n" +
        "Nearest Staircase\n12 metres\n\n" +
        "Public Washroom\nAdjacent to staircase.\n\n" +
        "Emergency Exit\nSouth corridor.\n\n" +
        "Room Access Log\n" +
        "20 July\n11:42 PM\nRoom Opened\nCard Access\n\n" +
        "21 July\n02:47 AM\nRoom Opened\nMechanical Key\n\n" +
        "No further entries."
    },
    {
      id: "autopsy_report_officer_anji",
      title: "Autopsy Report — Officer Anji",
      content:
        "AUTOPSY REPORT\n\n" +
        "Subject\nOfficer Anji\n\n" +
        "External Examination\n" +
        "Severe burn injuries\n" +
        "Blunt force trauma to the head\n" +
        "Multiple fractured fingernails\n" +
        "Foreign fibres recovered beneath fingernails\n" +
        "Smoke inhalation present\n\n" +
        "Internal Examination\n" +
        "Carbon monoxide detected in bloodstream\n" +
        "No alcohol detected\n" +
        "No narcotics detected\n\n" +
        "Cause of Death\nFire\n\n" +
        "Estimated Time of Death\nApproximately 03:10 AM\n\n" +
        "Medical Examiner\nDr. Rebecca Collins\nAshwood Forensic Institute\n\n" +
        "Report Complete."
    },
    {
      id: "interview_naina_sharma",
      title: "Interview Transcript — Naina Sharma",
      content:
        "INTERVIEW TRANSCRIPT\n\n" +
        "Subject\nNaina Sharma\nReceptionist\nAshwood Grand Hotel\n\n" +
        "Question\nWhere were you when the incident began?\n" +
        "Answer\n\"I was working at the reception desk.\"\n\n" +
        "Question\nWhat did you hear?\n" +
        "Answer\n\"A loud blast.\"\n\n" +
        "Question\nWhere did it come from?\n" +
        "Answer\n\"Near the public washroom.\"\n\n" +
        "Question\nWhat did you do next?\n" +
        "Answer\n\"I pressed the emergency fire alarm.\"\n\n" +
        "Question\nWhat happened after that?\n" +
        "Answer\n\"I ran outside.\"\n\n" +
        "Question\nWhere did you go?\n" +
        "Answer\n\"The nearby police station.\"\n\n" +
        "Question\nDid the fire begin immediately after the blast?\n" +
        "Answer\n\"I... don't remember\"\n\n" +
        "Interview concluded."
    }
  ]

  // Future parts (e.g. part2, part3) can be added here later without
  // changing any of the rendering/interaction logic below.
};

/* --------------------------------------------------------------------------
   7. EVIDENCE STATE
   --------------------------------------------------------------------------
   Tracks which evidence "part" is currently available and which evidence
   item (if any) is currently open in detail view.

   Part 1 is the active part, but individual evidence items within it stay
   locked until the player opens the item before them in sequence (see
   Section 11, the Evidence Progression System). unlockedEvidenceIds is
   the seam that system hooks into — nothing else here changes.

   openedEvidenceIds tracks which items the player has actually opened
   (as opposed to merely unlocked). This drives memory retention and
   determines when the next item in line unlocks.
   -------------------------------------------------------------------------- */

const evidenceState = {
  availablePartKeys: ["part1"],
  unlockedEvidenceIds: [],
  openedEvidenceIds: [],
  selectedEvidenceId: null
};

/**
 * Returns a flat array of EVERY evidence item across the available parts,
 * in the exact order they are defined in evidenceData. This is the
 * canonical progression order used for linear unlocking — it is not
 * filtered by unlock state.
 */
function getEvidenceOrder() {
  // Walk every part defined in evidenceData, in declaration order, rather
  // than evidenceState.availablePartKeys. availablePartKeys was hardcoded
  // to ["part1"] and never updated as new parts became available, which
  // silently capped the progression order at Part 1 and made Part 2/3
  // evidence unreachable even though it existed in evidenceData.
  return Object.keys(evidenceData).reduce((allEvidence, partKey) => {
    const items = evidenceData[partKey] || [];
    return allEvidence.concat(items);
  }, []);
}

/**
 * Returns a flat array of every evidence item currently available to the
 * player: it must belong to an available part AND have been unlocked
 * (see the Evidence Progression System, Section 11).
 */
function getAvailableEvidence() {
  return getEvidenceOrder().filter((item) =>
    evidenceState.unlockedEvidenceIds.includes(item.id)
  );
}

/**
 * Finds a single evidence item by id among the currently available items.
 */
function findEvidenceById(evidenceId) {
  return getAvailableEvidence().find((item) => item.id === evidenceId);
}

/* --------------------------------------------------------------------------
   8. RENDERING (EVIDENCE)
   -------------------------------------------------------------------------- */

/**
 * Renders the list of available evidence titles as selectable buttons.
 */
function renderEvidenceListView() {
  const availableEvidence = getAvailableEvidence();

  evidenceList.innerHTML = "";

  if (availableEvidence.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No evidence available.";
    evidenceList.appendChild(emptyMessage);
    return;
  }

  availableEvidence.forEach((item) => {
    const entryButton = document.createElement("button");
    entryButton.type = "button";
    entryButton.className = "app-button evidence-entry-button";
    entryButton.textContent = item.title;
    entryButton.addEventListener("click", () => {
      evidenceState.selectedEvidenceId = item.id;
      handleEvidenceOpened(item.id);
      renderEvidencePanel();
    });
    evidenceList.appendChild(entryButton);
  });
}

/**
 * Renders the full content of a single selected evidence item, along with
 * a button to return to the evidence list.
 */
function renderEvidenceDetailView(item) {
  evidenceList.innerHTML = "";

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "app-button evidence-back-button";
  backButton.textContent = "Back to Evidence List";
  backButton.addEventListener("click", () => {
    evidenceState.selectedEvidenceId = null;
    renderEvidencePanel();
  });

  const titleHeading = document.createElement("h3");
  titleHeading.className = "evidence-detail-title";
  titleHeading.textContent = item.title;

  const contentBody = document.createElement("p");
  contentBody.className = "evidence-detail-content";
  contentBody.textContent = item.content;

  evidenceList.appendChild(backButton);
  evidenceList.appendChild(titleHeading);
  evidenceList.appendChild(contentBody);
}

/**
 * Renders whichever evidence view is currently active: the list of
 * available evidence, or the detail view of a selected item.
 */
function renderEvidencePanel() {
  if (evidenceState.selectedEvidenceId) {
    const selectedItem = findEvidenceById(evidenceState.selectedEvidenceId);

    if (selectedItem) {
      renderEvidenceDetailView(selectedItem);
      return;
    }

    // Selected id no longer available (e.g. future unlocking systems);
    // fall back to the list view instead of showing nothing.
    evidenceState.selectedEvidenceId = null;
  }

  renderEvidenceListView();
}

/* --------------------------------------------------------------------------
   9. INTERACTION (EVIDENCE)
   -------------------------------------------------------------------------- */

/**
 * Opens the evidence panel and renders its current view.
 */
function openEvidencePanel() {
  evidencePanel.hidden = false;
  evidenceButton.setAttribute("aria-expanded", "true");
  renderEvidencePanel();
}

/**
 * Closes the evidence panel and resets the detail selection so the panel
 * reopens on the list view next time.
 */
function closeEvidencePanel() {
  evidencePanel.hidden = true;
  evidenceButton.setAttribute("aria-expanded", "false");
  evidenceState.selectedEvidenceId = null;
}

/**
 * Toggles the evidence panel open/closed when the Evidence button is
 * pressed.
 */
function handleEvidenceButtonClick() {
  const isCurrentlyOpen = !evidencePanel.hidden;

  if (isCurrentlyOpen) {
    closeEvidencePanel();
  } else {
    openEvidencePanel();
  }
}

evidenceButton.addEventListener("click", handleEvidenceButtonClick);
evidenceCloseButton.addEventListener("click", closeEvidencePanel);

/* ==========================================================================
   11. EVIDENCE PROGRESSION & MEMORY RETENTION SYSTEM
   --------------------------------------------------------------------------
   Progression is driven entirely by player action — there is no real-world
   time tracking of any kind. The rules:

     1. The investigation begins with only the first evidence item (per
        getEvidenceOrder()) unlocked.
     2. When the player OPENS an evidence item for the first time, memory
        retention % increases by one "step" (100 / total evidence count),
        and that item is marked as opened/read.
     3. Once an item has been opened and read, the NEXT item in the fixed
        evidence order unlocks and becomes visible in the evidence list.
     4. The evidence order itself is exactly the order evidence is defined
        in evidenceData — nothing here reorders or shuffles it.

   This section only ADDS evidence ids to evidenceState.unlockedEvidenceIds
   / evidenceState.openedEvidenceIds and re-renders the evidence list if
   it's open. It never touches how evidence is stored, listed, or
   displayed — that logic (Sections 7–9) is untouched.
   ========================================================================== */

/**
 * Current memory retention percentage (0-100), based on how many evidence
 * items the player has opened and read out of the total available.
 */
function getMemoryPercentage() {
  const totalEvidenceCount = getEvidenceOrder().length;

  if (totalEvidenceCount === 0) {
    return 0;
  }

  const rawPercentage = (evidenceState.openedEvidenceIds.length / totalEvidenceCount) * 100;
  return Math.max(0, Math.min(100, rawPercentage));
}

/**
 * Pushes the current memory percentage onto the existing memory retention
 * bar. Safe to call even if the bar elements aren't found in the DOM.
 */
function renderMemoryBar() {
  const percentage = getMemoryPercentage();
  const roundedPercentage = Math.round(percentage);

  if (memoryBarFill) {
    memoryBarFill.style.width = roundedPercentage + "%";
  }
  if (memoryBarLabel) {
    memoryBarLabel.textContent = roundedPercentage + "% Synchronized";
  }
}

/**
 * Displays a small, self-dismissing "New Evidence Available" notification.
 * Creates its own container on first use so it works regardless of what
 * markup already exists.
 */
function showNewEvidenceAvailableNotification(evidenceTitle) {
  let container = document.getElementById("memory-sync-notifications");

  if (!container) {
    container = document.createElement("div");
    container.id = "memory-sync-notifications";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const notification = document.createElement("div");
  notification.className = "memory-sync-notification";
  notification.textContent = "New Evidence Available: " + evidenceTitle;

  container.appendChild(notification);

  window.setTimeout(() => {
    notification.remove();
  }, 4000);
}

/**
 * Unlocks the next evidence item in the fixed progression order, if one
 * exists and it isn't already unlocked. Notifies the player and refreshes
 * the evidence list view if the panel is currently open on the list.
 */
function unlockNextEvidence(justOpenedEvidenceId) {
  const order = getEvidenceOrder();
  const currentIndex = order.findIndex((item) => item.id === justOpenedEvidenceId);

  if (currentIndex === -1) {
    return;
  }

  const nextItem = order[currentIndex + 1];
  if (!nextItem || evidenceState.unlockedEvidenceIds.includes(nextItem.id)) {
    return;
  }

  evidenceState.unlockedEvidenceIds.push(nextItem.id);
  showNewEvidenceAvailableNotification(nextItem.title);

  // Refresh the panel only if it's open, and only the list view
  // (a detail view stays open uninterrupted).
  const panelIsOpen = evidencePanel && !evidencePanel.hidden;
  if (panelIsOpen && !evidenceState.selectedEvidenceId) {
    renderEvidenceListView();
  }
}

/**
 * Called whenever the player opens an evidence item. On an item's first
 * open, this increases memory retention, unlocks the next item in the
 * sequence, and checks whether the final answer stage has been reached.
 * Re-opening an already-opened item does nothing further.
 */
function handleEvidenceOpened(evidenceId) {
  if (evidenceState.openedEvidenceIds.includes(evidenceId)) {
    return;
  }

  evidenceState.openedEvidenceIds.push(evidenceId);

  renderMemoryBar();
  unlockNextEvidence(evidenceId);
  revealAnswerSectionIfReady();
}

/**
 * Starts the Evidence Progression System: unlocks the first evidence item
 * in the fixed order and renders the memory retention bar at its initial
 * (0%) value.
 */
function initEvidenceProgression() {
  const order = getEvidenceOrder();
  const firstItem = order[0];

  if (firstItem && !evidenceState.unlockedEvidenceIds.includes(firstItem.id)) {
    evidenceState.unlockedEvidenceIds.push(firstItem.id);
  }

  renderMemoryBar();
}

/* ==========================================================================
   12. FINAL ANSWER SYSTEM
   --------------------------------------------------------------------------
   Stays hidden until every evidence item on the unlock timeline has become
   available (the "final required memory/evidence stage"). At that point it
   reveals a question, a text input, and a submit button. Checking is a
   simple cleaned-string comparison against a fixed list of accepted
   answers — no story reveal or mystery explanation, just the two required
   result messages.

   The answer UI is built here in script.js (rather than assumed to already
   exist in the HTML), since no such markup was part of the brief for
   earlier systems. It is appended to the document unobtrusively and stays
   hidden until earned, so it doesn't alter the existing UI design.
   ========================================================================== */

const ACCEPTED_ANSWERS = ["smoochkin", "detective smoochkin"];

const answerState = {
  revealed: false
};

let answerSection = null;
let answerInput = null;
let answerResult = null;

/**
 * Builds the (initially hidden) answer section and appends it to the
 * document. Called once during initialisation.
 */
function createAnswerSystem() {
  answerSection = document.createElement("section");
  answerSection.id = "answer-section";
  answerSection.hidden = true;

  const question = document.createElement("p");
  question.id = "answer-question";
  question.textContent = "Who killed Anji?";

  answerInput = document.createElement("input");
  answerInput.type = "text";
  answerInput.id = "answer-input";

  const submitButton = document.createElement("button");
  submitButton.type = "button";
  submitButton.id = "answer-submit-button";
  submitButton.className = "app-button";
  submitButton.textContent = "Submit";
  submitButton.addEventListener("click", handleAnswerSubmit);

  answerInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleAnswerSubmit();
    }
  });

  answerResult = document.createElement("p");
  answerResult.id = "answer-result";

  answerSection.appendChild(question);
  answerSection.appendChild(answerInput);
  answerSection.appendChild(submitButton);
  answerSection.appendChild(answerResult);

  document.body.appendChild(answerSection);
}

/**
 * True once every required evidence item has been opened and read.
 */
function isFinalStageReached() {
  const order = getEvidenceOrder();
  return (
    order.length > 0 &&
    order.every((item) => evidenceState.openedEvidenceIds.includes(item.id))
  );
}

/**
 * Reveals the answer section the first time the final stage is reached.
 * Safe to call repeatedly — does nothing once already revealed.
 */
function revealAnswerSectionIfReady() {
  if (answerState.revealed || !answerSection) {
    return;
  }

  if (isFinalStageReached()) {
    answerState.revealed = true;
    answerSection.hidden = false;
  }
}

/**
 * Cleans user input for comparison: trims ends, collapses internal
 * whitespace, and lowercases.
 */
function cleanAnswerText(rawText) {
  return rawText.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Reads the current input, checks it against the accepted answers, and
 * displays the corresponding result message.
 */
function handleAnswerSubmit() {
  const cleanedInput = cleanAnswerText(answerInput.value);
  const isCorrect = ACCEPTED_ANSWERS.includes(cleanedInput);

  answerResult.textContent = isCorrect
    ? "Case Solved."
    : "Incorrect conclusion. The investigation has failed.";
}

/* --------------------------------------------------------------------------
   10. INITIALISATION
   -------------------------------------------------------------------------- */

renderCurrentBlock();
createAnswerSystem();
initEvidenceProgression();
