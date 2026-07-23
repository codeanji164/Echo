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
     - Memory Synchronization percentage logic
     - Time-based evidence unlocking
     - Part 2 / Part 3 evidence
     - Timers, audio, localStorage
     - Answer / case submission checking
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
  ],

  part2: [
    {
      id: "newspaper_ashwood_times",
      title: "The Ashwood Times",
      content:
        "THE ASHWOOD TIMES\n22 July 2026\n\n" +
        "HOTEL FIRE CLAIMS 18 LIVES\n" +
        "A devastating fire broke out at the Ashwood Grand Hotel shortly after 3:00 AM yesterday.\n" +
        "Fire officials have confirmed 18 fatalities and 7 injuries. Authorities continue investigating the cause of the incident.\n" +
        "Officer Anji was among those confirmed deceased.\n" +
        "Detective Smoochkin remains hospitalized in critical condition.\n\n" +
        "BUSINESSMAN REPORTED MISSING\n" +
        "Local businessman Mr. Dodo, owner of Dodo Industries, has been reported missing after failing to return home yesterday evening.\n" +
        "Police have requested the public to report any information regarding his whereabouts.\n\n" +
        "FORENSIC TEAM SUSPECTS INCENDIARY DEVICE\n" +
        "Initial investigations indicate that the hotel fire may have involved an incendiary explosive device.\n" +
        "The exact chemical composition is still under forensic analysis.\n\n" +
        "AGRICULTURAL SUPPLIES WORTH \u20B939 LAKH STOLEN\n" +
        "Police have confirmed the theft of a large quantity of fertilizers, compost, industrial seed stock and agricultural processing equipment from a warehouse earlier this week.\n" +
        "No arrests have been made.\n\n" +
        "MR. DD ASSUMES TEMPORARY CONTROL\n" +
        "Following the disappearance of Mr. Dodo, his brother Mr. DD has announced he will temporarily oversee company operations.\n\n" +
        "End of Newspaper."
    },
    {
      id: "breaking_news_dodo_body",
      title: "Breaking News",
      content:
        "BREAKING NEWS\n\n" +
        "Police have recovered the body of Mr. Dodo near SugarCandy Lake.\n" +
        "The investigation remains ongoing."
    },
    {
      id: "autopsy_report_mr_dodo",
      title: "Autopsy Report — Mr. Dodo",
      content:
        "AUTOPSY REPORT\n\n" +
        "Subject\nMr. Dodo\n\n" +
        "External Examination\n" +
        "Single gunshot wound to upper neck\n" +
        "Blunt force injuries\n" +
        "Bruising around neck\n" +
        "Partial unidentified fingerprint recovered\n\n" +
        "Internal Examination\n" +
        "Severe blood loss\n" +
        "Bullet passed through cervical region\n\n" +
        "Estimated Time of Death\n" +
        "20 July 2026\n" +
        "Approximately 11:20 PM\n\n" +
        "Medical Examiner\nDr. Rebecca Collins\n\n" +
        "Report Complete."
    },
    {
      id: "ballistics_report",
      title: "Ballistics Report",
      content:
        "BALLISTICS REPORT\n\n" +
        "Recovered Projectile\n1\n\n" +
        "Weapon Type\nUnknown\n\n" +
        "Preliminary Analysis\n" +
        "Projectile entered from behind.\n" +
        "Victim was likely moving away from shooter.\n" +
        "Bullet characteristics consistent with black-market manufactured firearm.\n\n" +
        "Ballistics Division\nAshwood Police Department\n\n" +
        "Report Closed."
    },
    {
      id: "warehouse_investigation_report",
      title: "Warehouse Investigation Report",
      content:
        "WAREHOUSE INVESTIGATION REPORT\n\n" +
        "Property Owner\nMr. Dodo\n\n" +
        "Recovered\n" +
        "Large fertilizer residue\n" +
        "Industrial compost traces\n" +
        "Empty storage racks\n\n" +
        "No stolen agricultural supplies recovered.\n\n" +
        "Witness Statements\n" +
        "Warehouse workers stated they had been instructed not to discuss warehouse activity.\n" +
        "Workers stated that both Mr. Dodo and Mr. DD had previously provided financial compensation in exchange for confidentiality.\n\n" +
        "Investigation Continues."
    },
    {
      id: "personnel_file_officer_anji",
      title: "Personnel File — Officer Anji",
      content:
        "PERSONNEL FILE\n\n" +
        "Officer Name\nAnji\n\n" +
        "Years of Service\n10\n\n" +
        "Cases Solved\n167\n\n" +
        "Internal Complaints\n29\n\n" +
        "Complaint Summary\n" +
        "Excessive force during interrogation\n" +
        "Unauthorized intimidation of witnesses\n" +
        "Failure to follow arrest protocol\n" +
        "Aggressive conduct during investigations\n\n" +
        "Complaints Dismissed\n28\n\n" +
        "Disciplinary Actions\n1\n\n" +
        "Personnel Record\nPages 18\u201324 Missing\n\n" +
        "File Ends."
    },
    {
      id: "telecommunication_records",
      title: "Telecommunication Records",
      content:
        "TELECOMMUNICATION RECORDS\n20 July 2026\n\n" +
        "22:11\nMr. DD \u2194 Officer Anji\nDuration\n07m 18s\n\n" +
        "22:39\nMr. Dodo \u2192 Officer Anji\nMissed Call\n\n" +
        "22:47\nOfficer Anji \u2194 Mr. Dodo\nDuration\n13m 54s\n\n" +
        "23:18\nMr. DD \u2194 Ethan Brooks\nDuration\n04m 51s\n\n" +
        "23:36\nMr. DD \u2194 Naina Sharma\nDuration\n02m 18s\n\n" +
        "00:07\nNaina Sharma \u2194 Ethan Brooks\nDuration\n01m 44s\n\n" +
        "No further records."
    },
    {
      id: "memory_fragment",
      title: "Memory Fragment",
      content:
        "MEMORY FRAGMENT\n\n" +
        "Recovered Memory\n\n" +
        "Dark road.\n" +
        "Car headlights.\n" +
        "Rain on the windshield.\n" +
        "Officer Anji driving.\n" +
        "Silence.\n" +
        "Then\u2014\n" +
        "\u201cYou should've questioned him.\u201d\n" +
        "A pause.\n" +
        "\u201cI'm reporting this.\u201d\n" +
        "Brakes.\n" +
        "The vehicle stops.\n" +
        "Silence.\n" +
        "Memory Ends."
    },
    {
      id: "city_reference_file",
      title: "City Reference File",
      content:
        "CITY REFERENCE FILE\n\n" +
        "Relevant Locations\n\n" +
        "Ashwood Grand Hotel\n" +
        "Crystal Street\n" +
        "SugarCandy Lake\n" +
        "Ashwood Police Headquarters\n" +
        "Ashwood General Hospital\n\n" +
        "Reference Complete"
    }
  ],

  part3: [
    {
      id: "fingerprint_analysis_report",
      title: "Fingerprint Analysis Report",
      content:
        "FINGERPRINT ANALYSIS REPORT\n" +
        "Ashwood Police Department\n" +
        "Forensic Identification Unit\n\n" +
        "Recovered From\n" +
        "Victim: Mr. Dodo\n\n" +
        "Result\n" +
        "Partial fingerprint recovered.\n" +
        "Insufficient ridge detail for positive identification.\n\n" +
        "Database Search\n" +
        "One partial match found within the National Police Personnel Archive.\n" +
        "Officer identity remains encrypted under internal security protocol.\n\n" +
        "Encrypted Reference\n" +
        "SPAG1 SIR1 SPAG2 SPAG3 SIR2 SPAG1\n\n" +
        "Fingerprint analysis concluded."
    },
    {
      id: "explosives_laboratory_report",
      title: "Explosives Laboratory Report",
      content:
        "EXPLOSIVES LABORATORY REPORT\n\n" +
        "Location\n" +
        "Industrial Warehouse District\n" +
        "Near SugarCandy Lake\n\n" +
        "Recovered\n" +
        "Fertilizer residue\n" +
        "Industrial oxidizers\n" +
        "Mixing equipment\n" +
        "Empty storage drums\n\n" +
        "Condition\n" +
        "Abandoned\n" +
        "No personnel present.\n\n" +
        "Ownership\n" +
        "Unknown.\n\n" +
        "Samples forwarded for forensic comparison.\n\n" +
        "Report Complete."
    },
    {
      id: "forensic_comparison_report",
      title: "Forensic Comparison Report",
      content:
        "FORENSIC COMPARISON REPORT\n\n" +
        "Samples Compared\n" +
        "Hotel Fire Residue\n" +
        "Laboratory Residue\n\n" +
        "Result\n" +
        "Chemical composition consistent.\n" +
        "Primary compounds match.\n\n" +
        "Additional testing pending.\n\n" +
        "Report Closed."
    },
    {
      id: "cctv_recovery_report",
      title: "CCTV Recovery Report",
      content:
        "CCTV RECOVERY REPORT\n\n" +
        "Recovered Camera\n" +
        "Rear Service Entrance\n\n" +
        "Timeline\n" +
        "02:56 AM\n" +
        "Unknown maintenance vehicle arrives.\n\n" +
        "02:57 AM\n" +
        "Wooden desk unloaded.\n\n" +
        "02:58 AM\n" +
        "Desk moved toward staircase.\n\n" +
        "02:58 AM\n" +
        "Fire alarm activated.\n\n" +
        "03:01 AM\n" +
        "Explosion detected.\n\n" +
        "Additional Notes\n" +
        "Reception desk visible after fire suppression differs from transported desk.\n" +
        "Original transported desk not recovered.\n" +
        "Desk was not delivered to Room 1801.\n\n" +
        "Video enhancement incomplete."
    },
    {
      id: "weapon_recovery_report",
      title: "Weapon Recovery Report",
      content:
        "WEAPON RECOVERY REPORT\n\n" +
        "Recovered Weapon\n" +
        "Ashwood Police Service Pistol\n\n" +
        "Registered Owner\n" +
        "Officer Anji\n\n" +
        "Magazine Capacity\n17\n\n" +
        "Rounds Remaining\n17\n\n" +
        "Condition\n" +
        "Operational\n\n" +
        "Weapon secured."
    },
    {
      id: "public_statement_mr_dd",
      title: "Public Statement — Mr. DD",
      content:
        "PUBLIC STATEMENT\n" +
        "Mr. DD\n\n" +
        "\"The loss of my brother has devastated our family.\"\n" +
        "\"His funeral will be held this evening.\"\n" +
        "\"Regarding the warehouse under investigation, it was legally purchased through a third-party dealer.\"\n" +
        "\"We had no knowledge of any stolen agricultural supplies.\"\n\n" +
        "No further statement given."
    },
    {
      id: "laboratory_search_report",
      title: "Laboratory Search Report",
      content:
        "LABORATORY SEARCH REPORT\n\n" +
        "Recovered Items\n" +
        "Factory worker uniforms\n" +
        "Protective gloves\n" +
        "Safety goggles\n" +
        "Empty fertilizer sacks\n" +
        "Cosmetic item (Lipstick)\n\n" +
        "No identification documents recovered.\n\n" +
        "Search Complete."
    }
  ]

  // Future parts, if any, can be added here later without
  // changing any of the rendering/interaction logic below.
};

/* --------------------------------------------------------------------------
   7. EVIDENCE STATE
   --------------------------------------------------------------------------
   Tracks which evidence "part" is currently available and which evidence
   item (if any) is currently open in detail view.

   For now, all of Part 1's evidence is unlocked immediately — there is no
   synchronization percentage or time-based gating yet. availablePartKeys
   exists as the single seam a later unlocking system would extend.
   -------------------------------------------------------------------------- */

const evidenceState = {
  availablePartKeys: ["part1", "part2", "part3"],
  selectedEvidenceId: null
};

/**
 * Returns a flat array of every evidence item currently available to the
 * player, based on evidenceState.availablePartKeys.
 */
function getAvailableEvidence() {
  return evidenceState.availablePartKeys.reduce((allEvidence, partKey) => {
    const partEvidence = evidenceData[partKey] || [];
    return allEvidence.concat(partEvidence);
  }, []);
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

/* --------------------------------------------------------------------------
   10. INITIALISATION
   -------------------------------------------------------------------------- */

renderCurrentBlock();
