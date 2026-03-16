import React from "react";
import { maps } from "./MatchPage";

interface VetoRowProps {
  index: number;
  veto: Veto;
  leftTeamId: string | null;
  rightTeamId: string | null;
  teams: Team[];
  onVetoChange: (index: number, key: keyof Veto, value: any) => void;
}

export const VetoRow: React.FC<VetoRowProps> = ({
  index,
  veto,
  leftTeamId,
  rightTeamId,
  teams,
  onVetoChange,
}) => {
  const leftTeam = teams.find((team) => team._id === leftTeamId);
  const rightTeam = teams.find((team) => team._id === rightTeamId);
  const leftScore = leftTeamId ? veto.score?.[leftTeamId] ?? "" : "";
  const rightScore = rightTeamId ? veto.score?.[rightTeamId] ?? "" : "";

  const handleScoreChange = (
    teamId: string | null,
    value: string,
    otherTeamId: string | null,
  ) => {
    if (!teamId) return;

    const nextScore: Record<string, number> = {};

    if (otherTeamId && veto.score?.[otherTeamId] !== undefined) {
      nextScore[otherTeamId] = veto.score[otherTeamId];
    }

    if (value !== "") {
      nextScore[teamId] = Number(value);
    }

    onVetoChange(
      index,
      "score",
      Object.keys(nextScore).length > 0 ? nextScore : undefined,
    );
  };

  return (
    <tr className="bg-background-secondary odd:bg-background-primary">
      <td className="min-w-24 px-6 py-4">
        <h4 className="text-center font-semibold">Veto {index + 1}</h4>
      </td>
      <td className="min-w-32 px-6 py-4">
        <form className="flex w-full flex-col">
          <div className="flex w-full flex-col justify-center space-y-1">
            {["pick", "ban", "decider"].map((option) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option}
                  checked={veto.type === option}
                  onChange={(e) => {
                    const newType = e.target.value as
                      | "pick"
                      | "ban"
                      | "decider";
                    onVetoChange(index, "type", newType);
                  }}
                  name="Type"
                  className="form-radio text-primary"
                />
                <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
              </label>
            ))}
          </div>
        </form>
      </td>
      <td className="min-w-36 px-6 py-4">
        <div className="w-full">
          <select
            disabled={veto.type === "decider"}
            value={veto.type === "decider" ? "decider" : veto.teamId || ""}
            onChange={(e) => onVetoChange(index, "teamId", e.target.value)}
            name={veto.type === "decider" ? "Decider" : "Team"}
          >
            <option value="" disabled>
              Team
            </option>
            {veto.type === "decider" && (
              <option value="decider">Decider</option>
            )}
            {leftTeamId && leftTeam && (
              <option value={leftTeamId}>{leftTeam.name}</option>
            )}
            {rightTeamId && rightTeam && (
              <option value={rightTeamId}>{rightTeam.name}</option>
            )}
          </select>
        </div>
      </td>
      <td className="min-w-36 px-6 py-4">
        <div className="w-full">
          <select
            value={veto.mapName || ""}
            onChange={(e) => {
              onVetoChange(index, "mapName", e.target.value);
            }}
            name="Map"
          >
            <option value="" disabled>
              Map
            </option>
            {maps.map((map) => (
              <option key={map} value={map}>
                {map.charAt(3).toUpperCase() + map.slice(4)}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className="min-w-28 px-6 py-4">
        <div className="w-full">
          <select
            value={veto.side}
            onChange={(e) => {
              const newSide = e.target.value as "CT" | "T" | "NO";
              onVetoChange(index, "side", newSide);
            }}
            name="Side"
          >
            <option value="NO">No Side</option>
            <option value="CT">CT</option>
            <option value="T">T</option>
          </select>
        </div>
      </td>
      <td className="min-w-24 px-6 py-4">
        <div className="col-span-2 flex w-full flex-col items-center justify-center">
          <input
            type="checkbox"
            id={`reverseSide-${index}`}
            checked={veto.reverseSide === true}
            onChange={(e) => onVetoChange(index, "reverseSide", e.target.checked)}
          />
        </div>
      </td>
      <td className="min-w-36 px-6 py-4">
        <div className="w-full">
          <select
            value={veto.winner || ""}
            onChange={(e) =>
              onVetoChange(index, "winner", e.target.value || undefined)
            }
            name="Winner"
          >
            <option value="">No winner</option>
            {leftTeamId && leftTeam && (
              <option value={leftTeamId}>{leftTeam.name}</option>
            )}
            {rightTeamId && rightTeam && (
              <option value={rightTeamId}>{rightTeam.name}</option>
            )}
          </select>
        </div>
      </td>
      <td className="min-w-32 px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <input
            type="number"
            min={0}
            className="h-8 w-16 rounded border border-gray-300 px-2 text-center"
            value={leftScore}
            onChange={(e) =>
              handleScoreChange(leftTeamId, e.target.value, rightTeamId)
            }
            aria-label={`Left score for veto ${index + 1}`}
          />
          <span>-</span>
          <input
            type="number"
            min={0}
            className="h-8 w-16 rounded border border-gray-300 px-2 text-center"
            value={rightScore}
            onChange={(e) =>
              handleScoreChange(rightTeamId, e.target.value, leftTeamId)
            }
            aria-label={`Right score for veto ${index + 1}`}
          />
        </div>
      </td>
      <td className="min-w-24 px-6 py-4">
        <div className="flex w-full items-center justify-center">
          <input
            type="checkbox"
            id={`mapEnd-${index}`}
            checked={veto.mapEnd}
            onChange={(e) => onVetoChange(index, "mapEnd", e.target.checked)}
          />
        </div>
      </td>
    </tr>
  );
};
