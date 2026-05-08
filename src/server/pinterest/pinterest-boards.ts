import type { PinterestBoardResponse, PinterestBoardsListResponse } from "./pinterest.types";
import { pinterestApiFetch } from "./pinterest-client";

export interface NormalizedBoard {
  pinterestBoardId: string;
  name: string;
  description: string | null;
  url: string | null;
  privacy: string | null;
  ownerUsername: string | null;
}

export async function fetchPinterestBoards(accessToken: string): Promise<NormalizedBoard[]> {
  const allBoards: NormalizedBoard[] = [];
  let bookmark: string | null = null;

  do {
    const queryParams = new URLSearchParams({ page_size: "25" });
    if (bookmark) {
      queryParams.set("bookmark", bookmark);
    }

    const response = await pinterestApiFetch<PinterestBoardsListResponse>(
      `/boards?${queryParams.toString()}`,
      { accessToken },
    );

    const boards = response.items || [];
    for (const board of boards) {
      allBoards.push(normalizeBoard(board));
    }

    bookmark = response.bookmark || null;
  } while (bookmark);

  return allBoards;
}

function normalizeBoard(board: PinterestBoardResponse): NormalizedBoard {
  return {
    pinterestBoardId: board.id,
    name: board.name,
    description: board.description || null,
    url: board.url || null,
    privacy: board.privacy || null,
    ownerUsername: board.owner?.username || null,
  };
}
