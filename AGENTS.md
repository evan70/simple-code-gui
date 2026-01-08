# Agent workflow (Beads)

Use Beads (`bd`) for planning and task tracking. Do not invent TODO lists in markdown.

Start of every session:
1) Run `bd doctor` (fix/migrate if needed).
2) Run `bd ready` and pick ONE ready task (prefer highest priority).
3) Run `bd show <id>` and treat it as the current source of truth.
4) Implement the smallest safe increment toward finishing that task.
5) When you learn something important, update the task (notes/comments) in Beads.
6) When the task is complete, close it in Beads (don’t just say “done” in chat).

If no tasks are ready, create one with `bd create "..."` and link blockers with `bd dep add ...`.

after you are done with any beads task or any task in general you can run "cd "/home/user/Programs/Pure Harmony Midi Editor/plugin/build" && cmake --build . --config Release 2>&1 | tail -30" to build the project.
