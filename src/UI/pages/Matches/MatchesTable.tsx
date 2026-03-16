import {
  MdPlayArrow,
  MdCancel,
  MdDelete,
  MdEdit,
  MdSwapHoriz,
  MdContentCopy,
} from "react-icons/md";
import { PrimaryButton } from "../../components/PrimaryButton";
import { apiUrl } from "../../api/api";
import { useMatches } from "../../hooks";
import useGameData from "../../context/useGameData";
import { canReverseSides } from "./matchUtils";
import { teamApi } from '../Teams/teamsApi';
import React from "react";

interface MatchTableProps {
  onEdit: (match: Match) => void;
}

export const MatchesTable = ({ onEdit }: MatchTableProps) => {
  const { filteredMatches } = useMatches();


  return (
    <div className="overflow-y-auto relative flex-1 w-full">
      <table className="table-fixed w-full">
        <thead className="sticky top-0 border-b border-border bg-background-secondary shadow">
          <tr>
            <th className="p-4 text-sm" align="left">
              Match
            </th>
            <th className="p-4 text-sm" align="center">
              Type
            </th>
            <th className="p-4 text-sm" align="center">
              Score
            </th>
            <th className="p-4 text-sm" align="right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background-secondary">
          {filteredMatches.map((match: Match) => (
            <MatchRow key={match.id} match={match} onEdit={onEdit} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface MatchRowProps {
  match: Match;
  onEdit: (match: Match) => void;
}

const MatchRow = ({ match, onEdit }: MatchRowProps) => {
  const { deleteMatch, handleStartMatch, handleStopMatch, currentMatch, updateMatch } = useMatches();
  const { gameData } = useGameData();
  const [teamOne, setTeamOne] = React.useState<Team>();
  const [teamTwo, setTeamTwo] = React.useState<Team>();
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "failed">("idle");
  const [reverseBlink, setReverseBlink] = React.useState(false);


  React.useEffect(() => {
    const fetchTeams = async () => {
      if (match.left && match.left.id) {
        setTeamOne(await teamApi.getById(match.left.id));
      } else {
        setTeamOne(undefined);
      }
      if (match.right && match.right.id) {
        setTeamTwo(await teamApi.getById(match.right.id));
      } else {
        setTeamTwo(undefined);
      }
    };
    fetchTeams();
  }, [match]);

  React.useEffect(() => {
    if (copyState === "idle") return;

    const timeout = window.setTimeout(() => {
      setCopyState("idle");
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [copyState]);

  React.useEffect(() => {
    if (!reverseBlink) return;

    const timeout = window.setTimeout(() => {
      setReverseBlink(false);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [reverseBlink]);

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(match);
    }
  };

  const handleReverseSides = async () => {
    try {
      if (!gameData || !gameData.map || !gameData.map.name) return;
      setReverseBlink(true);
      const mapName = gameData.map.name.substring(gameData.map.name.lastIndexOf("/") + 1);
      const veto = match.vetos.find((v) => v.mapName === mapName);
      if (!veto) return;
      const updatedVetos = match.vetos.map((v) =>
        v.mapName === mapName ? { ...v, reverseSide: !v.reverseSide } : v,
      );
      const updatedMatch: Match = { ...match, vetos: updatedVetos };
      await updateMatch(match.id, updatedMatch);
    } catch (err) {
      console.error("Failed to reverse sides on veto:", err);
    }
  };

  const copyText = async (value: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };

  const handleCopyHudLink = async () => {
    const fallbackUrl = "http://localhost:1349/api/hud";

    try {
      const response = await fetch(`${apiUrl}/system/hud-url`);
      const data = response.ok ? ((await response.json()) as { url?: string }) : null;
      const url = data?.url || fallbackUrl;
      await copyText(url);
      setCopyState("copied");
    } catch (error) {
      try {
        await copyText(fallbackUrl);
        setCopyState("copied");
      } catch {
        setCopyState("failed");
      }
      console.error("Failed to copy HUD link:", error);
    }
  };

  const copyTitle =
    copyState === "copied"
      ? "Copied HUD link"
      : copyState === "failed"
        ? "Copy failed"
        : "Copy HUD link";
  const copyButtonClass =
    copyState === "idle" ? "" : "bg-background-light ring-2 ring-primary transition-all";
  const reverseButtonClass =
    reverseBlink ? "bg-background-light ring-2 ring-primary transition-all" : "";

  return (
    <tr id={"match_" + match.id}>
      <td className="px-4 py-2 text-xl font-semibold md:text-2xl" align="left">
        <span className="mr-4">
          {teamOne?.name} vs {teamTwo?.name}
        </span>
        {match.current ? (
          <span className="font-semibold text-secondary">LIVE</span>
        ) : (
          ""
        )}
      </td>
      <td
        className="px-4 py-2 font-semibold uppercase text-gray-400"
        align="center"
      >
        {match.matchType}
      </td>
      <td className="px-4 py-2 text-lg font-semibold" align="center">
        <h6 className="flex items-center justify-center gap-2">
          <img
            src={`${apiUrl}/teams/logo/${teamOne?._id}`}
            alt="Team Logo"
            className="size-12"
          />
        {match.left && match.left.wins} - {match.right && match.right.wins}{" "}
          <img
            src={`${apiUrl}/teams/logo/${teamTwo?._id}`}
            alt="Team Logo"
            className="size-12"
          />
        </h6>
      </td>
      <td className="px-4 py-2" align="right">
        <div className="inline-flex">
        {match.current ? (
            <>
              <PrimaryButton onClick={() => handleStopMatch(match.id)}>
                <MdCancel className="size-6 text-secondary-light" />
              </PrimaryButton>
              <PrimaryButton
                onClick={handleCopyHudLink}
                title={copyTitle}
                className={copyButtonClass}
              >
                <MdContentCopy className="size-6" />
              </PrimaryButton>
              <PrimaryButton
                onClick={() => handleReverseSides()}
                title="Reverse sides for current map veto"
                disabled={!canReverseSides(match, gameData)}
                className={reverseButtonClass}
              >
                <MdSwapHoriz className="size-6" />
              </PrimaryButton>
            </>
        ) : (
          currentMatch && currentMatch.id !== match.id ? (
            <></>
          ) : (
            <>
              <PrimaryButton onClick={handleStartMatch.bind(null, match.id)}>
                <MdPlayArrow className="size-6" />
              </PrimaryButton>
              <PrimaryButton
                onClick={handleCopyHudLink}
                title={copyTitle}
                className={copyButtonClass}
              >
                <MdContentCopy className="size-6" />
              </PrimaryButton>
            </>
          )
        )}
            <PrimaryButton onClick={() => handleEditClick()}>
              <MdEdit className="size-6" />
            </PrimaryButton>

            <PrimaryButton onClick={() => deleteMatch(match.id)}>
              <MdDelete className="size-6" />
            </PrimaryButton>
          </div>
      </td>
    </tr>
  );
};
