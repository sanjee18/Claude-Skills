# Claude Skills

Private Sammlung eigener Claude-Code-Skills. Jeder Unterordner ist ein Skill.

## Installation (neuer Rechner)

```powershell
git clone https://github.com/sanjee18/Claude-Skills "$env:USERPROFILE\.claude\skills"
```
(Falls `~/.claude/skills` schon existiert: Repo woanders klonen und den Skill-Ordner hineinkopieren.)

Update: `git -C "$env:USERPROFILE\.claude\skills" pull`

## Skills
- `html-experience-studio` – maßgeschneiderte interaktive HTML-Keynotes (Erlebnis-Hub, eigenes Hub-Objekt, Offline-Datei).
  Optional für Screenshot-Prüfung: `npm install` in `html-experience-studio/tools`.
