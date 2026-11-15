/*
 * Exercise database.
 *
 * Each entry: E(name, muscle, equipment, type, rom, bwf, met)
 *   type  'w'  = weighted (external load + part of bodyweight that moves)
 *         'bw' = bodyweight (optional added weight, e.g. weighted pull-up)
 *         'a'  = assisted bodyweight (weight entered = assistance, subtracted)
 *         'h'  = timed hold / carry (seconds, optional load)
 *         'c'  = cardio (minutes + intensity). met = [light, moderate, vigorous]
 *   rom   = range of motion the load travels per rep, in metres
 *   bwf   = fraction of bodyweight that is moved each rep
 *   met   = MET value while the set is being performed (Compendium of Physical Activities based)
 */
(function () {
  const L = [];
  const E = (n, m, e, t, r, b, k) => L.push({ n, m, e, t, r, b, k });

  /* ---------------- CHEST ---------------- */
  E('Bench Press (Barbell)', 'Chest', 'Barbell', 'w', 0.45, 0.05, 5);
  E('Incline Bench Press (Barbell)', 'Chest', 'Barbell', 'w', 0.45, 0.05, 5);
  E('Decline Bench Press (Barbell)', 'Chest', 'Barbell', 'w', 0.4, 0.05, 5);
  E('Close-Grip Bench Press (Barbell)', 'Triceps', 'Barbell', 'w', 0.4, 0.05, 5);
  E('Paused Bench Press (Barbell)', 'Chest', 'Barbell', 'w', 0.45, 0.05, 5);
  E('Floor Press (Barbell)', 'Chest', 'Barbell', 'w', 0.3, 0.05, 4.5);
  E('Bench Press (Dumbbell)', 'Chest', 'Dumbbell', 'w', 0.45, 0.05, 5);
  E('Incline Bench Press (Dumbbell)', 'Chest', 'Dumbbell', 'w', 0.45, 0.05, 5);
  E('Decline Bench Press (Dumbbell)', 'Chest', 'Dumbbell', 'w', 0.4, 0.05, 5);
  E('Floor Press (Dumbbell)', 'Chest', 'Dumbbell', 'w', 0.3, 0.05, 4.5);
  E('Squeeze Press (Dumbbell)', 'Chest', 'Dumbbell', 'w', 0.4, 0.05, 4.5);
  E('Chest Fly (Dumbbell)', 'Chest', 'Dumbbell', 'w', 0.4, 0.05, 3.5);
  E('Incline Chest Fly (Dumbbell)', 'Chest', 'Dumbbell', 'w', 0.4, 0.05, 3.5);
  E('Pullover (Dumbbell)', 'Chest', 'Dumbbell', 'w', 0.5, 0.08, 3.5);
  E('Bench Press (Smith Machine)', 'Chest', 'Smith Machine', 'w', 0.45, 0.05, 4.5);
  E('Incline Bench Press (Smith Machine)', 'Chest', 'Smith Machine', 'w', 0.45, 0.05, 4.5);
  E('Chest Press (Machine)', 'Chest', 'Machine', 'w', 0.4, 0, 4);
  E('Incline Chest Press (Machine)', 'Chest', 'Machine', 'w', 0.4, 0, 4);
  E('Decline Chest Press (Machine)', 'Chest', 'Machine', 'w', 0.4, 0, 4);
  E('Iso-Lateral Chest Press (Machine)', 'Chest', 'Machine', 'w', 0.4, 0, 4);
  E('Pec Deck (Machine)', 'Chest', 'Machine', 'w', 0.35, 0, 3.5);
  E('Cable Fly Crossover', 'Chest', 'Cable', 'w', 0.45, 0, 3.5);
  E('Low to High Cable Fly', 'Chest', 'Cable', 'w', 0.45, 0, 3.5);
  E('High to Low Cable Fly', 'Chest', 'Cable', 'w', 0.45, 0, 3.5);
  E('Cable Chest Press', 'Chest', 'Cable', 'w', 0.4, 0, 4);
  E('Landmine Press', 'Chest', 'Barbell', 'w', 0.45, 0.05, 4.5);
  E('Svend Press (Plate)', 'Chest', 'Plate', 'w', 0.3, 0, 3.5);
  E('Push Up', 'Chest', 'Bodyweight', 'bw', 0.3, 0.64, 4.5);
  E('Incline Push Up', 'Chest', 'Bodyweight', 'bw', 0.3, 0.45, 4);
  E('Decline Push Up', 'Chest', 'Bodyweight', 'bw', 0.3, 0.74, 5);
  E('Wide Grip Push Up', 'Chest', 'Bodyweight', 'bw', 0.28, 0.64, 4.5);
  E('Diamond Push Up', 'Triceps', 'Bodyweight', 'bw', 0.3, 0.64, 4.5);
  E('Knee Push Up', 'Chest', 'Bodyweight', 'bw', 0.3, 0.49, 3.8);
  E('Clap Push Up', 'Chest', 'Bodyweight', 'bw', 0.4, 0.64, 7);
  E('Archer Push Up', 'Chest', 'Bodyweight', 'bw', 0.3, 0.75, 5);
  E('Hindu Push Up', 'Chest', 'Bodyweight', 'bw', 0.4, 0.6, 5);
  E('Ring Push Up', 'Chest', 'Other', 'bw', 0.3, 0.64, 5);
  E('Chest Dip', 'Chest', 'Bodyweight', 'bw', 0.45, 0.95, 5);
  E('Assisted Chest Dip (Machine)', 'Chest', 'Machine', 'a', 0.45, 0.95, 4.5);
  E('Ring Dip', 'Chest', 'Other', 'bw', 0.45, 0.95, 5.5);

  /* ---------------- BACK ---------------- */
  E('Deadlift (Barbell)', 'Back', 'Barbell', 'w', 0.55, 0.5, 6);
  E('Sumo Deadlift (Barbell)', 'Back', 'Barbell', 'w', 0.45, 0.5, 6);
  E('Deficit Deadlift (Barbell)', 'Back', 'Barbell', 'w', 0.62, 0.5, 6);
  E('Trap Bar Deadlift', 'Back', 'Trap Bar', 'w', 0.5, 0.5, 6);
  E('Deadlift (Dumbbell)', 'Back', 'Dumbbell', 'w', 0.5, 0.5, 5.5);
  E('Rack Pull (Barbell)', 'Back', 'Barbell', 'w', 0.3, 0.35, 5);
  E('Romanian Deadlift (Barbell)', 'Hamstrings', 'Barbell', 'w', 0.45, 0.45, 5);
  E('Romanian Deadlift (Dumbbell)', 'Hamstrings', 'Dumbbell', 'w', 0.45, 0.45, 5);
  E('Stiff Leg Deadlift (Barbell)', 'Hamstrings', 'Barbell', 'w', 0.5, 0.45, 5);
  E('Good Morning (Barbell)', 'Hamstrings', 'Barbell', 'w', 0.45, 0.5, 4.5);
  E('Bent Over Row (Barbell)', 'Back', 'Barbell', 'w', 0.4, 0.15, 5);
  E('Pendlay Row (Barbell)', 'Back', 'Barbell', 'w', 0.45, 0.15, 5);
  E('Yates Row (Barbell)', 'Back', 'Barbell', 'w', 0.35, 0.12, 5);
  E('T-Bar Row', 'Back', 'Barbell', 'w', 0.35, 0.12, 5);
  E('Meadows Row (Barbell)', 'Back', 'Barbell', 'w', 0.35, 0.05, 4.5);
  E('Bent Over Row (Dumbbell)', 'Back', 'Dumbbell', 'w', 0.4, 0.15, 5);
  E('Dumbbell Row (Single Arm)', 'Back', 'Dumbbell', 'w', 0.4, 0.05, 4.5);
  E('Kroc Row (Dumbbell)', 'Back', 'Dumbbell', 'w', 0.45, 0.05, 5.5);
  E('Chest Supported Row (Dumbbell)', 'Back', 'Dumbbell', 'w', 0.35, 0, 4);
  E('Seal Row (Barbell)', 'Back', 'Barbell', 'w', 0.4, 0, 4);
  E('Renegade Row (Dumbbell)', 'Back', 'Dumbbell', 'w', 0.3, 0.3, 5.5);
  E('Seated Cable Row', 'Back', 'Cable', 'w', 0.4, 0, 4);
  E('Single Arm Cable Row', 'Back', 'Cable', 'w', 0.4, 0, 4);
  E('Wide Grip Seated Cable Row', 'Back', 'Cable', 'w', 0.4, 0, 4);
  E('Lat Pulldown (Cable)', 'Lats', 'Cable', 'w', 0.5, 0, 4);
  E('Wide Grip Lat Pulldown', 'Lats', 'Cable', 'w', 0.5, 0, 4);
  E('Close Grip Lat Pulldown', 'Lats', 'Cable', 'w', 0.5, 0, 4);
  E('Reverse Grip Lat Pulldown', 'Lats', 'Cable', 'w', 0.5, 0, 4);
  E('Single Arm Lat Pulldown', 'Lats', 'Cable', 'w', 0.5, 0, 3.8);
  E('Lat Pulldown (Machine)', 'Lats', 'Machine', 'w', 0.5, 0, 4);
  E('Iso-Lateral Pulldown (Machine)', 'Lats', 'Machine', 'w', 0.5, 0, 4);
  E('Straight Arm Pulldown (Cable)', 'Lats', 'Cable', 'w', 0.5, 0, 3.5);
  E('Cable Pullover', 'Lats', 'Cable', 'w', 0.5, 0, 3.5);
  E('Seated Row (Machine)', 'Back', 'Machine', 'w', 0.35, 0, 4);
  E('Iso-Lateral Row (Machine)', 'Back', 'Machine', 'w', 0.35, 0, 4);
  E('T-Bar Row (Machine)', 'Back', 'Machine', 'w', 0.35, 0.05, 4.5);
  E('Pull Up', 'Lats', 'Bodyweight', 'bw', 0.5, 1.0, 6);
  E('Chin Up', 'Lats', 'Bodyweight', 'bw', 0.5, 1.0, 6);
  E('Wide Grip Pull Up', 'Lats', 'Bodyweight', 'bw', 0.45, 1.0, 6);
  E('Neutral Grip Pull Up', 'Lats', 'Bodyweight', 'bw', 0.5, 1.0, 6);
  E('Kipping Pull Up', 'Lats', 'Bodyweight', 'bw', 0.5, 1.0, 7);
  E('Scapular Pull Up', 'Lats', 'Bodyweight', 'bw', 0.08, 1.0, 3.5);
  E('Assisted Pull Up (Machine)', 'Lats', 'Machine', 'a', 0.5, 1.0, 5);
  E('Assisted Chin Up (Machine)', 'Lats', 'Machine', 'a', 0.5, 1.0, 5);
  E('Band Assisted Pull Up', 'Lats', 'Band', 'a', 0.5, 1.0, 5);
  E('Negative Pull Up', 'Lats', 'Bodyweight', 'bw', 0.25, 1.0, 4.5);
  E('Muscle Up', 'Lats', 'Bodyweight', 'bw', 0.9, 1.0, 7.5);
  E('Inverted Row', 'Back', 'Bodyweight', 'bw', 0.35, 0.6, 4.5);
  E('Ring Row', 'Back', 'Other', 'bw', 0.35, 0.55, 4.5);
  E('Back Extension (Hyperextension)', 'Lower Back', 'Bodyweight', 'bw', 0.4, 0.5, 3.5);
  E('Back Extension (Machine)', 'Lower Back', 'Machine', 'w', 0.35, 0, 3.5);
  E('Reverse Hyperextension', 'Glutes', 'Machine', 'w', 0.4, 0.3, 3.5);
  E('Jefferson Curl', 'Lower Back', 'Barbell', 'w', 0.4, 0.4, 3);
  E('Superman', 'Lower Back', 'Bodyweight', 'bw', 0.15, 0.2, 3);
  E('Face Pull (Cable)', 'Shoulders', 'Cable', 'w', 0.35, 0, 3.5);
  E('Shrug (Barbell)', 'Traps', 'Barbell', 'w', 0.08, 0, 3);
  E('Shrug (Dumbbell)', 'Traps', 'Dumbbell', 'w', 0.08, 0, 3);
  E('Shrug (Trap Bar)', 'Traps', 'Trap Bar', 'w', 0.08, 0, 3);
  E('Shrug (Smith Machine)', 'Traps', 'Smith Machine', 'w', 0.08, 0, 3);
  E('Shrug (Machine)', 'Traps', 'Machine', 'w', 0.08, 0, 3);
  E('Shrug (Cable)', 'Traps', 'Cable', 'w', 0.08, 0, 3);

  /* ---------------- SHOULDERS ---------------- */
  E('Overhead Press (Barbell)', 'Shoulders', 'Barbell', 'w', 0.5, 0.05, 5);
  E('Seated Overhead Press (Barbell)', 'Shoulders', 'Barbell', 'w', 0.5, 0.05, 4.5);
  E('Behind the Neck Press (Barbell)', 'Shoulders', 'Barbell', 'w', 0.45, 0.05, 4.5);
  E('Push Press (Barbell)', 'Shoulders', 'Barbell', 'w', 0.6, 0.2, 6.5);
  E('Z Press (Barbell)', 'Shoulders', 'Barbell', 'w', 0.5, 0.05, 4.5);
  E('Shoulder Press (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.45, 0.05, 4.5);
  E('Seated Shoulder Press (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.45, 0.05, 4.5);
  E('Arnold Press (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.5, 0.05, 4.5);
  E('Shoulder Press (Machine)', 'Shoulders', 'Machine', 'w', 0.45, 0, 4);
  E('Shoulder Press (Smith Machine)', 'Shoulders', 'Smith Machine', 'w', 0.45, 0.05, 4.5);
  E('Single Arm Landmine Press', 'Shoulders', 'Barbell', 'w', 0.45, 0.05, 4.5);
  E('Kettlebell Press', 'Shoulders', 'Kettlebell', 'w', 0.5, 0.05, 4.5);
  E('Bradford Press (Barbell)', 'Shoulders', 'Barbell', 'w', 0.35, 0.05, 4.5);
  E('Lateral Raise (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.5, 0.03, 3.5);
  E('Seated Lateral Raise (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.5, 0.03, 3.3);
  E('Lean Away Lateral Raise (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.55, 0.03, 3.5);
  E('Lateral Raise (Cable)', 'Shoulders', 'Cable', 'w', 0.5, 0.03, 3.5);
  E('Lateral Raise (Machine)', 'Shoulders', 'Machine', 'w', 0.45, 0, 3.5);
  E('Lateral Raise (Band)', 'Shoulders', 'Band', 'w', 0.5, 0.03, 3);
  E('Front Raise (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.55, 0.03, 3.5);
  E('Front Raise (Barbell)', 'Shoulders', 'Barbell', 'w', 0.55, 0.03, 3.5);
  E('Front Raise (Plate)', 'Shoulders', 'Plate', 'w', 0.55, 0.03, 3.5);
  E('Front Raise (Cable)', 'Shoulders', 'Cable', 'w', 0.55, 0.03, 3.5);
  E('Rear Delt Fly (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.45, 0.03, 3.5);
  E('Rear Delt Fly (Cable)', 'Shoulders', 'Cable', 'w', 0.45, 0, 3.5);
  E('Reverse Pec Deck (Machine)', 'Shoulders', 'Machine', 'w', 0.4, 0, 3.5);
  E('Rear Delt Row (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.35, 0.05, 4);
  E('Upright Row (Barbell)', 'Shoulders', 'Barbell', 'w', 0.4, 0, 4);
  E('Upright Row (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.4, 0, 4);
  E('Upright Row (Cable)', 'Shoulders', 'Cable', 'w', 0.4, 0, 4);
  E('Cuban Press (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.5, 0, 3.5);
  E('Y Raise (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.55, 0.03, 3.3);
  E('Lu Raise (Plate)', 'Shoulders', 'Plate', 'w', 0.8, 0.03, 3.5);
  E('External Rotation (Cable)', 'Shoulders', 'Cable', 'w', 0.25, 0, 2.8);
  E('External Rotation (Dumbbell)', 'Shoulders', 'Dumbbell', 'w', 0.25, 0, 2.8);
  E('Band Pull Apart', 'Shoulders', 'Band', 'w', 0.4, 0, 3);
  E('Pike Push Up', 'Shoulders', 'Bodyweight', 'bw', 0.3, 0.7, 5);
  E('Handstand Push Up', 'Shoulders', 'Bodyweight', 'bw', 0.35, 1.0, 6);
  E('Wall Walk', 'Shoulders', 'Bodyweight', 'bw', 0.9, 0.6, 6);

  /* ---------------- BICEPS ---------------- */
  E('Bicep Curl (Barbell)', 'Biceps', 'Barbell', 'w', 0.4, 0.03, 3.5);
  E('EZ Bar Curl', 'Biceps', 'EZ Bar', 'w', 0.4, 0.03, 3.5);
  E('Bicep Curl (Dumbbell)', 'Biceps', 'Dumbbell', 'w', 0.4, 0.03, 3.5);
  E('Hammer Curl (Dumbbell)', 'Biceps', 'Dumbbell', 'w', 0.4, 0.03, 3.5);
  E('Cross Body Hammer Curl (Dumbbell)', 'Biceps', 'Dumbbell', 'w', 0.4, 0.03, 3.5);
  E('Incline Curl (Dumbbell)', 'Biceps', 'Dumbbell', 'w', 0.45, 0.03, 3.3);
  E('Concentration Curl (Dumbbell)', 'Biceps', 'Dumbbell', 'w', 0.4, 0.02, 3);
  E('Spider Curl (Dumbbell)', 'Biceps', 'Dumbbell', 'w', 0.4, 0.02, 3.3);
  E('Zottman Curl (Dumbbell)', 'Biceps', 'Dumbbell', 'w', 0.4, 0.03, 3.5);
  E('Preacher Curl (EZ Bar)', 'Biceps', 'EZ Bar', 'w', 0.4, 0.02, 3.3);
  E('Preacher Curl (Dumbbell)', 'Biceps', 'Dumbbell', 'w', 0.4, 0.02, 3.3);
  E('Preacher Curl (Machine)', 'Biceps', 'Machine', 'w', 0.4, 0, 3.3);
  E('Bicep Curl (Machine)', 'Biceps', 'Machine', 'w', 0.4, 0, 3.3);
  E('Bicep Curl (Cable)', 'Biceps', 'Cable', 'w', 0.4, 0.03, 3.5);
  E('Rope Hammer Curl (Cable)', 'Biceps', 'Cable', 'w', 0.4, 0.03, 3.5);
  E('Bayesian Curl (Cable)', 'Biceps', 'Cable', 'w', 0.45, 0.03, 3.3);
  E('High Cable Curl', 'Biceps', 'Cable', 'w', 0.35, 0.02, 3.3);
  E('Drag Curl (Barbell)', 'Biceps', 'Barbell', 'w', 0.3, 0.03, 3.3);
  E('Reverse Curl (Barbell)', 'Forearms', 'Barbell', 'w', 0.4, 0.03, 3.3);
  E('Reverse Curl (EZ Bar)', 'Forearms', 'EZ Bar', 'w', 0.4, 0.03, 3.3);
  E('21s Bicep Curl (Barbell)', 'Biceps', 'Barbell', 'w', 0.27, 0.03, 3.5);
  E('Bicep Curl (Band)', 'Biceps', 'Band', 'w', 0.4, 0.03, 3);

  /* ---------------- TRICEPS ---------------- */
  E('Triceps Pushdown (Straight Bar)', 'Triceps', 'Cable', 'w', 0.35, 0, 3.5);
  E('Triceps Rope Pushdown', 'Triceps', 'Cable', 'w', 0.38, 0, 3.5);
  E('Single Arm Triceps Pushdown', 'Triceps', 'Cable', 'w', 0.35, 0, 3.3);
  E('Reverse Grip Triceps Pushdown', 'Triceps', 'Cable', 'w', 0.35, 0, 3.3);
  E('Overhead Triceps Extension (Cable)', 'Triceps', 'Cable', 'w', 0.4, 0.02, 3.5);
  E('Overhead Triceps Extension (Dumbbell)', 'Triceps', 'Dumbbell', 'w', 0.4, 0.02, 3.5);
  E('Overhead Triceps Extension (EZ Bar)', 'Triceps', 'EZ Bar', 'w', 0.4, 0.02, 3.5);
  E('Skull Crusher (EZ Bar)', 'Triceps', 'EZ Bar', 'w', 0.35, 0.02, 3.5);
  E('Skull Crusher (Barbell)', 'Triceps', 'Barbell', 'w', 0.35, 0.02, 3.5);
  E('Skull Crusher (Dumbbell)', 'Triceps', 'Dumbbell', 'w', 0.35, 0.02, 3.5);
  E('Triceps Kickback (Dumbbell)', 'Triceps', 'Dumbbell', 'w', 0.3, 0.02, 3);
  E('Triceps Kickback (Cable)', 'Triceps', 'Cable', 'w', 0.3, 0.02, 3);
  E('Triceps Extension (Machine)', 'Triceps', 'Machine', 'w', 0.35, 0, 3.3);
  E('Triceps Dip', 'Triceps', 'Bodyweight', 'bw', 0.4, 0.95, 5);
  E('Bench Dip', 'Triceps', 'Bodyweight', 'bw', 0.35, 0.6, 4);
  E('Assisted Dip (Machine)', 'Triceps', 'Machine', 'a', 0.4, 0.95, 4.5);
  E('Seated Dip (Machine)', 'Triceps', 'Machine', 'w', 0.35, 0, 4);
  E('JM Press (Barbell)', 'Triceps', 'Barbell', 'w', 0.3, 0.02, 4);
  E('Tate Press (Dumbbell)', 'Triceps', 'Dumbbell', 'w', 0.3, 0.02, 3.5);

  /* ---------------- FOREARMS / GRIP ---------------- */
  E('Wrist Curl (Barbell)', 'Forearms', 'Barbell', 'w', 0.08, 0, 2.5);
  E('Wrist Curl (Dumbbell)', 'Forearms', 'Dumbbell', 'w', 0.08, 0, 2.5);
  E('Reverse Wrist Curl (Barbell)', 'Forearms', 'Barbell', 'w', 0.08, 0, 2.5);
  E('Reverse Wrist Curl (Dumbbell)', 'Forearms', 'Dumbbell', 'w', 0.08, 0, 2.5);
  E('Wrist Roller', 'Forearms', 'Other', 'w', 0.9, 0, 3);
  E('Behind the Back Wrist Curl (Barbell)', 'Forearms', 'Barbell', 'w', 0.08, 0, 2.5);
  E('Dead Hang', 'Forearms', 'Bodyweight', 'h', 0, 0, 3);
  E('Plate Pinch', 'Forearms', 'Plate', 'h', 0, 0, 2.8);
  E("Farmer's Walk", 'Full Body', 'Dumbbell', 'h', 0, 0, 6);
  E("Farmer's Walk (Trap Bar)", 'Full Body', 'Trap Bar', 'h', 0, 0, 6);
  E('Suitcase Carry', 'Core', 'Dumbbell', 'h', 0, 0, 5);
  E('Overhead Carry', 'Shoulders', 'Dumbbell', 'h', 0, 0, 5);
  E('Sandbag Carry', 'Full Body', 'Other', 'h', 0, 0, 6.5);
  E('Yoke Carry', 'Full Body', 'Other', 'h', 0, 0, 7);

  /* ---------------- QUADS ---------------- */
  E('Squat (Barbell)', 'Quads', 'Barbell', 'w', 0.55, 0.85, 6);
  E('Low Bar Squat (Barbell)', 'Quads', 'Barbell', 'w', 0.5, 0.85, 6);
  E('Front Squat (Barbell)', 'Quads', 'Barbell', 'w', 0.55, 0.85, 6);
  E('Pause Squat (Barbell)', 'Quads', 'Barbell', 'w', 0.55, 0.85, 6);
  E('Box Squat (Barbell)', 'Quads', 'Barbell', 'w', 0.45, 0.85, 5.5);
  E('Zercher Squat (Barbell)', 'Quads', 'Barbell', 'w', 0.55, 0.85, 6);
  E('Overhead Squat (Barbell)', 'Quads', 'Barbell', 'w', 0.55, 0.85, 6);
  E('Safety Bar Squat', 'Quads', 'Barbell', 'w', 0.55, 0.85, 6);
  E('Squat (Smith Machine)', 'Quads', 'Smith Machine', 'w', 0.55, 0.85, 5.5);
  E('Squat (Dumbbell)', 'Quads', 'Dumbbell', 'w', 0.5, 0.85, 5.5);
  E('Goblet Squat', 'Quads', 'Kettlebell', 'w', 0.5, 0.85, 5.5);
  E('Hack Squat (Machine)', 'Quads', 'Machine', 'w', 0.5, 0.8, 5.5);
  E('Reverse Hack Squat (Machine)', 'Glutes', 'Machine', 'w', 0.5, 0.8, 5.5);
  E('Pendulum Squat (Machine)', 'Quads', 'Machine', 'w', 0.5, 0.75, 5.5);
  E('Belt Squat (Machine)', 'Quads', 'Machine', 'w', 0.5, 0.75, 5.5);
  E('V Squat (Machine)', 'Quads', 'Machine', 'w', 0.5, 0.75, 5.5);
  E('Leg Press (Machine)', 'Quads', 'Machine', 'w', 0.45, 0.15, 5);
  E('Single Leg Press (Machine)', 'Quads', 'Machine', 'w', 0.45, 0.08, 4.5);
  E('Horizontal Leg Press (Machine)', 'Quads', 'Machine', 'w', 0.4, 0.15, 4.5);
  E('Leg Extension (Machine)', 'Quads', 'Machine', 'w', 0.4, 0.03, 3.5);
  E('Single Leg Extension (Machine)', 'Quads', 'Machine', 'w', 0.4, 0.02, 3.3);
  E('Bulgarian Split Squat (Dumbbell)', 'Quads', 'Dumbbell', 'w', 0.45, 0.8, 5.5);
  E('Bulgarian Split Squat (Barbell)', 'Quads', 'Barbell', 'w', 0.45, 0.8, 5.5);
  E('Bulgarian Split Squat (Bodyweight)', 'Quads', 'Bodyweight', 'bw', 0.45, 0.8, 5);
  E('Split Squat (Dumbbell)', 'Quads', 'Dumbbell', 'w', 0.4, 0.8, 5);
  E('Lunge (Dumbbell)', 'Quads', 'Dumbbell', 'w', 0.45, 0.85, 5.5);
  E('Lunge (Barbell)', 'Quads', 'Barbell', 'w', 0.45, 0.85, 5.5);
  E('Lunge (Bodyweight)', 'Quads', 'Bodyweight', 'bw', 0.45, 0.85, 5);
  E('Walking Lunge (Dumbbell)', 'Quads', 'Dumbbell', 'w', 0.45, 0.85, 6);
  E('Walking Lunge (Bodyweight)', 'Quads', 'Bodyweight', 'bw', 0.45, 0.85, 5.5);
  E('Reverse Lunge (Dumbbell)', 'Quads', 'Dumbbell', 'w', 0.45, 0.85, 5.5);
  E('Reverse Lunge (Barbell)', 'Quads', 'Barbell', 'w', 0.45, 0.85, 5.5);
  E('Lateral Lunge (Dumbbell)', 'Adductors', 'Dumbbell', 'w', 0.4, 0.85, 5);
  E('Curtsy Lunge (Dumbbell)', 'Glutes', 'Dumbbell', 'w', 0.4, 0.85, 5);
  E('Jumping Lunge', 'Quads', 'Bodyweight', 'bw', 0.55, 0.9, 8);
  E('Step Up (Dumbbell)', 'Quads', 'Dumbbell', 'w', 0.45, 0.9, 5.5);
  E('Step Up (Barbell)', 'Quads', 'Barbell', 'w', 0.45, 0.9, 5.5);
  E('Step Up (Bodyweight)', 'Quads', 'Bodyweight', 'bw', 0.45, 0.9, 5);
  E('Air Squat', 'Quads', 'Bodyweight', 'bw', 0.45, 0.85, 5);
  E('Jump Squat', 'Quads', 'Bodyweight', 'bw', 0.6, 0.85, 8);
  E('Pistol Squat', 'Quads', 'Bodyweight', 'bw', 0.55, 0.9, 6);
  E('Sissy Squat', 'Quads', 'Bodyweight', 'bw', 0.4, 0.7, 4);
  E('Cossack Squat', 'Adductors', 'Bodyweight', 'bw', 0.4, 0.85, 4.5);
  E('Box Jump', 'Quads', 'Bodyweight', 'bw', 0.6, 1.0, 8);
  E('Broad Jump', 'Quads', 'Bodyweight', 'bw', 0.5, 1.0, 8);
  E('Tuck Jump', 'Quads', 'Bodyweight', 'bw', 0.5, 1.0, 8.5);
  E('Wall Sit', 'Quads', 'Bodyweight', 'h', 0, 0, 4);

  /* ---------------- HAMSTRINGS ---------------- */
  E('Lying Leg Curl (Machine)', 'Hamstrings', 'Machine', 'w', 0.3, 0.03, 3.5);
  E('Seated Leg Curl (Machine)', 'Hamstrings', 'Machine', 'w', 0.3, 0.02, 3.5);
  E('Standing Leg Curl (Machine)', 'Hamstrings', 'Machine', 'w', 0.3, 0.02, 3.3);
  E('Nordic Hamstring Curl', 'Hamstrings', 'Bodyweight', 'bw', 0.5, 0.6, 5);
  E('Glute Ham Raise', 'Hamstrings', 'Bodyweight', 'bw', 0.5, 0.6, 5);
  E('Stability Ball Leg Curl', 'Hamstrings', 'Other', 'bw', 0.25, 0.3, 3.5);
  E('Single Leg Romanian Deadlift (Dumbbell)', 'Hamstrings', 'Dumbbell', 'w', 0.45, 0.5, 4.5);
  E('Single Leg Romanian Deadlift (Kettlebell)', 'Hamstrings', 'Kettlebell', 'w', 0.45, 0.5, 4.5);
  E('Kettlebell Swing', 'Hamstrings', 'Kettlebell', 'w', 0.8, 0.35, 8);
  E('Single Arm Kettlebell Swing', 'Hamstrings', 'Kettlebell', 'w', 0.8, 0.35, 8);
  E('Cable Pull Through', 'Glutes', 'Cable', 'w', 0.45, 0.3, 4);
  E('Leg Curl (Dumbbell)', 'Hamstrings', 'Dumbbell', 'w', 0.3, 0.03, 3.3);

  /* ---------------- GLUTES ---------------- */
  E('Hip Thrust (Barbell)', 'Glutes', 'Barbell', 'w', 0.3, 0.4, 4.5);
  E('Hip Thrust (Machine)', 'Glutes', 'Machine', 'w', 0.3, 0.4, 4.5);
  E('Hip Thrust (Smith Machine)', 'Glutes', 'Smith Machine', 'w', 0.3, 0.4, 4.5);
  E('Hip Thrust (Dumbbell)', 'Glutes', 'Dumbbell', 'w', 0.3, 0.4, 4.3);
  E('Single Leg Hip Thrust', 'Glutes', 'Bodyweight', 'bw', 0.3, 0.45, 4);
  E('B-Stance Hip Thrust (Barbell)', 'Glutes', 'Barbell', 'w', 0.3, 0.4, 4.5);
  E('Glute Bridge (Barbell)', 'Glutes', 'Barbell', 'w', 0.25, 0.4, 4);
  E('Glute Bridge', 'Glutes', 'Bodyweight', 'bw', 0.25, 0.4, 3.5);
  E('Single Leg Glute Bridge', 'Glutes', 'Bodyweight', 'bw', 0.25, 0.45, 3.5);
  E('Frog Pump', 'Glutes', 'Bodyweight', 'bw', 0.2, 0.4, 3.5);
  E('Glute Kickback (Cable)', 'Glutes', 'Cable', 'w', 0.4, 0.08, 3.5);
  E('Glute Kickback (Machine)', 'Glutes', 'Machine', 'w', 0.4, 0.05, 3.5);
  E('Donkey Kick', 'Glutes', 'Bodyweight', 'bw', 0.3, 0.1, 3);
  E('Fire Hydrant', 'Glutes', 'Bodyweight', 'bw', 0.25, 0.08, 3);
  E('Clamshell (Band)', 'Abductors', 'Band', 'bw', 0.15, 0.05, 2.5);
  E('Hip Abduction (Machine)', 'Abductors', 'Machine', 'w', 0.2, 0, 3);
  E('Hip Adduction (Machine)', 'Adductors', 'Machine', 'w', 0.2, 0, 3);
  E('Hip Abduction (Cable)', 'Abductors', 'Cable', 'w', 0.3, 0.05, 3);
  E('Hip Adduction (Cable)', 'Adductors', 'Cable', 'w', 0.3, 0.05, 3);
  E('Lateral Band Walk', 'Abductors', 'Band', 'h', 0, 0, 3.5);
  E('Copenhagen Plank', 'Adductors', 'Bodyweight', 'h', 0, 0, 3.5);

  /* ---------------- CALVES ---------------- */
  E('Standing Calf Raise (Machine)', 'Calves', 'Machine', 'w', 0.1, 0.9, 3.5);
  E('Standing Calf Raise (Smith Machine)', 'Calves', 'Smith Machine', 'w', 0.1, 0.9, 3.5);
  E('Standing Calf Raise (Dumbbell)', 'Calves', 'Dumbbell', 'w', 0.1, 0.95, 3.5);
  E('Single Leg Calf Raise', 'Calves', 'Bodyweight', 'bw', 0.1, 0.95, 3.5);
  E('Calf Raise (Bodyweight)', 'Calves', 'Bodyweight', 'bw', 0.1, 0.95, 3);
  E('Seated Calf Raise (Machine)', 'Calves', 'Machine', 'w', 0.1, 0.05, 3);
  E('Calf Press (Leg Press)', 'Calves', 'Machine', 'w', 0.1, 0, 3);
  E('Donkey Calf Raise', 'Calves', 'Machine', 'w', 0.1, 0.9, 3.5);
  E('Tibialis Raise', 'Calves', 'Bodyweight', 'bw', 0.06, 0.05, 2.5);
  E('Pogo Jumps', 'Calves', 'Bodyweight', 'bw', 0.15, 1.0, 7);

  /* ---------------- CORE ---------------- */
  E('Crunch', 'Core', 'Bodyweight', 'bw', 0.15, 0.3, 3);
  E('Decline Crunch', 'Core', 'Bodyweight', 'bw', 0.2, 0.35, 3.5);
  E('Cable Crunch', 'Core', 'Cable', 'w', 0.3, 0.1, 3.5);
  E('Crunch (Machine)', 'Core', 'Machine', 'w', 0.25, 0.05, 3.3);
  E('Reverse Crunch', 'Core', 'Bodyweight', 'bw', 0.2, 0.3, 3.5);
  E('Bicycle Crunch', 'Obliques', 'Bodyweight', 'bw', 0.2, 0.3, 4);
  E('Oblique Crunch', 'Obliques', 'Bodyweight', 'bw', 0.15, 0.25, 3);
  E('Sit Up', 'Core', 'Bodyweight', 'bw', 0.35, 0.4, 4);
  E('Decline Sit Up', 'Core', 'Bodyweight', 'bw', 0.4, 0.45, 4.5);
  E('Jackknife Sit Up', 'Core', 'Bodyweight', 'bw', 0.4, 0.45, 4.5);
  E('V Up', 'Core', 'Bodyweight', 'bw', 0.45, 0.45, 4.5);
  E('Toe Touch Crunch', 'Core', 'Bodyweight', 'bw', 0.15, 0.3, 3);
  E('Hanging Leg Raise', 'Core', 'Bodyweight', 'bw', 0.5, 0.35, 4.5);
  E('Hanging Knee Raise', 'Core', 'Bodyweight', 'bw', 0.35, 0.3, 4);
  E("Captain's Chair Leg Raise", 'Core', 'Machine', 'bw', 0.45, 0.3, 4);
  E('Lying Leg Raise', 'Core', 'Bodyweight', 'bw', 0.4, 0.3, 3.5);
  E('Toes to Bar', 'Core', 'Bodyweight', 'bw', 0.75, 0.35, 5.5);
  E('Ab Wheel Rollout', 'Core', 'Other', 'bw', 0.6, 0.5, 5);
  E('Dragon Flag', 'Core', 'Bodyweight', 'bw', 0.6, 0.5, 5);
  E('Russian Twist', 'Obliques', 'Bodyweight', 'bw', 0.3, 0.15, 4);
  E('Russian Twist (Plate)', 'Obliques', 'Plate', 'w', 0.4, 0.15, 4);
  E('Windshield Wipers', 'Obliques', 'Bodyweight', 'bw', 0.5, 0.35, 4.5);
  E('Side Bend (Dumbbell)', 'Obliques', 'Dumbbell', 'w', 0.2, 0.05, 3);
  E('Cable Woodchopper', 'Obliques', 'Cable', 'w', 0.7, 0.05, 3.5);
  E('Landmine Rotation', 'Obliques', 'Barbell', 'w', 0.8, 0.05, 4);
  E('Pallof Press (Cable)', 'Core', 'Cable', 'w', 0.3, 0, 3);
  E('Dead Bug', 'Core', 'Bodyweight', 'bw', 0.25, 0.15, 3);
  E('Bird Dog', 'Core', 'Bodyweight', 'bw', 0.2, 0.1, 2.5);
  E('Heel Taps', 'Obliques', 'Bodyweight', 'bw', 0.1, 0.2, 3);
  E('Plank', 'Core', 'Bodyweight', 'h', 0, 0, 3.8);
  E('Side Plank', 'Obliques', 'Bodyweight', 'h', 0, 0, 3.3);
  E('Hollow Body Hold', 'Core', 'Bodyweight', 'h', 0, 0, 3.8);
  E('L-Sit Hold', 'Core', 'Bodyweight', 'h', 0, 0, 4);
  E('Flutter Kicks', 'Core', 'Bodyweight', 'h', 0, 0, 4);
  E('Superman Hold', 'Lower Back', 'Bodyweight', 'h', 0, 0, 3);
  E('Handstand Hold', 'Shoulders', 'Bodyweight', 'h', 0, 0, 4.5);
  E('Glute Bridge Hold', 'Glutes', 'Bodyweight', 'h', 0, 0, 3);

  /* ---------------- OLYMPIC / FULL BODY ---------------- */
  E('Power Clean', 'Full Body', 'Barbell', 'w', 0.9, 0.4, 8);
  E('Hang Clean', 'Full Body', 'Barbell', 'w', 0.65, 0.4, 7.5);
  E('Squat Clean', 'Full Body', 'Barbell', 'w', 1.1, 0.6, 8);
  E('Clean and Jerk', 'Full Body', 'Barbell', 'w', 1.6, 0.6, 8);
  E('Clean and Press', 'Full Body', 'Barbell', 'w', 1.4, 0.4, 8);
  E('Snatch', 'Full Body', 'Barbell', 'w', 1.7, 0.6, 8);
  E('Power Snatch', 'Full Body', 'Barbell', 'w', 1.5, 0.4, 8);
  E('Hang Snatch', 'Full Body', 'Barbell', 'w', 1.2, 0.4, 7.5);
  E('Clean Pull', 'Full Body', 'Barbell', 'w', 0.65, 0.4, 6.5);
  E('Snatch Pull', 'Full Body', 'Barbell', 'w', 0.7, 0.4, 6.5);
  E('Push Jerk', 'Full Body', 'Barbell', 'w', 0.55, 0.25, 7);
  E('Split Jerk', 'Full Body', 'Barbell', 'w', 0.55, 0.25, 7);
  E('Thruster (Barbell)', 'Full Body', 'Barbell', 'w', 1.0, 0.6, 8);
  E('Thruster (Dumbbell)', 'Full Body', 'Dumbbell', 'w', 1.0, 0.6, 8);
  E('Dumbbell Snatch', 'Full Body', 'Dumbbell', 'w', 1.4, 0.35, 8);
  E('Dumbbell Clean', 'Full Body', 'Dumbbell', 'w', 0.9, 0.35, 7.5);
  E('Kettlebell Clean', 'Full Body', 'Kettlebell', 'w', 0.9, 0.3, 7);
  E('Kettlebell Snatch', 'Full Body', 'Kettlebell', 'w', 1.4, 0.35, 8.5);
  E('Kettlebell High Pull', 'Full Body', 'Kettlebell', 'w', 0.8, 0.3, 7.5);
  E('Turkish Get Up (Kettlebell)', 'Full Body', 'Kettlebell', 'w', 1.6, 0.6, 5);
  E('Man Maker (Dumbbell)', 'Full Body', 'Dumbbell', 'w', 1.3, 0.7, 8.5);
  E('Devil Press (Dumbbell)', 'Full Body', 'Dumbbell', 'w', 1.5, 0.7, 9);
  E('Wall Ball', 'Full Body', 'Other', 'w', 2.5, 0.25, 8);
  E('Medicine Ball Slam', 'Full Body', 'Other', 'w', 1.5, 0.15, 8);
  E('Burpee', 'Full Body', 'Bodyweight', 'bw', 0.9, 1.0, 8);
  E('Burpee Pull Up', 'Full Body', 'Bodyweight', 'bw', 1.4, 1.0, 9);
  E('Burpee Box Jump Over', 'Full Body', 'Bodyweight', 'bw', 1.4, 1.0, 9);
  E('Squat Thrust', 'Full Body', 'Bodyweight', 'bw', 0.5, 0.8, 7);
  E('Star Jump', 'Full Body', 'Bodyweight', 'bw', 0.5, 1.0, 8);
  E('Tire Flip', 'Full Body', 'Other', 'w', 1.0, 0.4, 8);
  E('Sandbag Clean', 'Full Body', 'Other', 'w', 1.0, 0.4, 7.5);
  E('Atlas Stone Lift', 'Full Body', 'Other', 'w', 1.1, 0.5, 8);
  E('Landmine Squat to Press', 'Full Body', 'Barbell', 'w', 1.0, 0.6, 7);
  E('Kettlebell Goblet Squat to Press', 'Full Body', 'Kettlebell', 'w', 1.0, 0.6, 7);
  E('Rope Climb', 'Full Body', 'Other', 'bw', 4.0, 1.0, 8);

  /* ---------------- CARDIO (minutes) ---------------- */
  const C = (n, m, e, mets) => E(n, m, e, 'c', 0, 0, mets);
  C('Running (Treadmill)', 'Cardio', 'Cardio Machine', [8.3, 9.8, 11.8]);
  C('Running (Outdoor)', 'Cardio', 'None', [8.3, 9.8, 11.8]);
  C('Jogging', 'Cardio', 'None', [6.0, 7.0, 8.0]);
  C('Sprints / Intervals', 'Cardio', 'None', [10.0, 12.0, 14.5]);
  C('Walking', 'Cardio', 'None', [2.8, 3.5, 4.3]);
  C('Incline Treadmill Walk', 'Cardio', 'Cardio Machine', [5.3, 6.5, 8.0]);
  C('Rucking (Weighted Walk)', 'Cardio', 'Other', [5.0, 6.5, 8.0]);
  C('Hiking', 'Cardio', 'None', [5.3, 6.0, 7.8]);
  C('Cycling (Stationary)', 'Cardio', 'Cardio Machine', [5.5, 7.0, 10.0]);
  C('Cycling (Outdoor)', 'Cardio', 'Other', [6.0, 8.0, 10.0]);
  C('Spin Class', 'Cardio', 'Cardio Machine', [6.8, 8.5, 10.3]);
  C('Air Bike / Assault Bike', 'Cardio', 'Cardio Machine', [6.0, 9.0, 12.0]);
  C('Rowing Machine', 'Cardio', 'Cardio Machine', [4.8, 7.0, 8.5]);
  C('Ski Erg', 'Cardio', 'Cardio Machine', [5.0, 7.0, 9.0]);
  C('Elliptical Trainer', 'Cardio', 'Cardio Machine', [4.5, 5.0, 6.5]);
  C('Stair Climber / StairMaster', 'Cardio', 'Cardio Machine', [6.8, 8.8, 9.5]);
  C('Stair Running', 'Cardio', 'None', [9.0, 11.0, 15.0]);
  C('Jump Rope', 'Cardio', 'Other', [8.8, 11.8, 12.3]);
  C('Jumping Jacks', 'Cardio', 'Bodyweight', [5.0, 7.7, 8.0]);
  C('High Knees', 'Cardio', 'Bodyweight', [6.0, 8.0, 10.0]);
  C('Mountain Climbers', 'Cardio', 'Bodyweight', [6.0, 8.0, 10.0]);
  C('Bear Crawl', 'Cardio', 'Bodyweight', [5.0, 7.0, 9.0]);
  C('Battle Ropes', 'Cardio', 'Other', [6.0, 8.0, 10.3]);
  C('Sled Push', 'Cardio', 'Other', [6.0, 8.0, 10.0]);
  C('Sled Pull / Drag', 'Cardio', 'Other', [6.0, 8.0, 10.0]);
  C('HIIT Circuit', 'Cardio', 'Bodyweight', [6.0, 8.0, 10.0]);
  C('CrossFit WOD', 'Cardio', 'Other', [6.0, 8.0, 11.0]);
  C('Circuit Training', 'Cardio', 'Other', [4.3, 6.0, 8.0]);
  C('Swimming (Freestyle)', 'Cardio', 'None', [5.8, 8.3, 10.0]);
  C('Swimming (Breaststroke)', 'Cardio', 'None', [5.3, 7.0, 10.3]);
  C('Swimming (Backstroke)', 'Cardio', 'None', [4.8, 7.0, 9.5]);
  C('Swimming (Butterfly)', 'Cardio', 'None', [9.0, 11.0, 13.8]);
  C('Aqua Aerobics', 'Cardio', 'None', [3.5, 5.3, 6.0]);
  C('Boxing (Heavy Bag)', 'Cardio', 'Other', [5.5, 7.8, 9.0]);
  C('Boxing (Sparring)', 'Cardio', 'None', [7.8, 9.0, 12.8]);
  C('Kickboxing', 'Cardio', 'None', [6.0, 7.8, 10.3]);
  C('Shadow Boxing', 'Cardio', 'None', [4.5, 6.0, 7.8]);
  C('Martial Arts (BJJ / Judo / Karate)', 'Cardio', 'None', [5.3, 7.8, 10.3]);
  C('Wrestling', 'Cardio', 'None', [6.0, 6.0, 8.0]);
  C('Dance / Zumba', 'Cardio', 'None', [5.5, 6.5, 7.3]);
  C('Step Aerobics', 'Cardio', 'Other', [5.5, 7.0, 8.5]);
  C('Rock Climbing / Bouldering', 'Cardio', 'Other', [5.8, 7.3, 8.0]);
  C('Basketball', 'Cardio', 'None', [6.0, 6.5, 8.0]);
  C('Football / Soccer', 'Cardio', 'None', [7.0, 8.0, 10.0]);
  C('Tennis', 'Cardio', 'Other', [5.0, 7.3, 8.0]);
  C('Badminton', 'Cardio', 'Other', [5.5, 5.5, 7.0]);
  C('Squash', 'Cardio', 'Other', [7.3, 9.0, 12.0]);
  C('Table Tennis', 'Cardio', 'Other', [4.0, 4.0, 5.0]);
  C('Cricket', 'Cardio', 'Other', [4.8, 4.8, 6.0]);
  C('Volleyball', 'Cardio', 'None', [3.0, 4.0, 8.0]);
  C('Rugby', 'Cardio', 'None', [6.3, 8.3, 10.0]);
  C('Hockey', 'Cardio', 'Other', [7.8, 8.0, 10.0]);
  C('Golf (Walking)', 'Cardio', 'Other', [3.5, 4.3, 4.8]);
  C('Skating / Rollerblading', 'Cardio', 'Other', [5.0, 7.0, 9.8]);
  C('Skiing (Downhill)', 'Cardio', 'Other', [4.3, 5.3, 8.0]);
  C('Cross Country Skiing', 'Cardio', 'Other', [6.8, 9.0, 12.5]);
  C('Kayaking / Canoeing', 'Cardio', 'Other', [3.5, 5.0, 7.0]);
  C('Surfing', 'Cardio', 'Other', [3.0, 5.0, 6.0]);
  C('Yoga', 'Cardio', 'None', [2.5, 3.0, 4.0]);
  C('Power Yoga / Vinyasa', 'Cardio', 'None', [3.3, 4.0, 5.0]);
  C('Pilates', 'Cardio', 'Other', [3.0, 3.5, 4.0]);
  C('Stretching / Mobility', 'Cardio', 'None', [2.3, 2.3, 2.8]);
  C('Foam Rolling', 'Cardio', 'Other', [2.0, 2.0, 2.3]);

  const slug = (s) => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  window.EXERCISES = L.map((x) => ({ id: slug(x.n), ...x }));

  window.MUSCLES = [
    'Chest', 'Back', 'Lats', 'Lower Back', 'Traps', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
    'Quads', 'Hamstrings', 'Glutes', 'Adductors', 'Abductors', 'Calves', 'Core', 'Obliques',
    'Full Body', 'Cardio',
  ];
  window.EQUIPMENT = [
    'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Smith Machine', 'Kettlebell', 'EZ Bar', 'Trap Bar',
    'Plate', 'Band', 'Bodyweight', 'Cardio Machine', 'Other', 'None',
  ];
  window.TYPE_LABEL = {
    w: 'Weight × Reps', bw: 'Bodyweight Reps', a: 'Assisted Bodyweight', h: 'Timed Hold / Carry', c: 'Cardio (Time)',
  };
})();
