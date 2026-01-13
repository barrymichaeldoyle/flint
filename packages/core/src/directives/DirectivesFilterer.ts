import type {
	CommentDirective,
	CommentDirectiveWithinFile,
} from "../types/directives.ts";
import type { FileReport } from "../types/reports.ts";
import { computeDirectiveRanges } from "./computeDirectiveRanges.ts";
import { createSelectionMatcher } from "./createSelectionMatcher.ts";
import { isCommentDirectiveWithinFile } from "./predicates.ts";
import { selectionMatchesDirectiveRanges } from "./selectionMatchesDirectiveRanges.ts";
import { selectionMatchesReport } from "./selectionMatchesReport.ts";

export interface FilterResult {
	reports: FileReport[];
	unusedDirectives: CommentDirective[];
}

export class DirectivesFilterer {
	#directivesForFile: CommentDirective[] = [];
	#directivesForRanges: CommentDirectiveWithinFile[] = [];

	add(directives: CommentDirective[]) {
		for (const directive of directives) {
			if (isCommentDirectiveWithinFile(directive)) {
				this.#directivesForRanges.push(directive);
			} else {
				this.#directivesForFile.push(directive);
			}
		}
	}

	filter(reports: FileReport[]): FilterResult {
		const selectionsForFile = this.#directivesForFile.flatMap((directive) =>
			directive.selections.map((selection) => ({
				directive,
				matcher: createSelectionMatcher(selection),
				selection,
			})),
		);

		const directiveRanges = computeDirectiveRanges(this.#directivesForRanges);
		const matchedDirectives = new Set<CommentDirective>();

		const filteredReports = reports.filter((report) => {
			const fileMatched = selectionsForFile.some(({ directive, matcher }) => {
				const matches = selectionMatchesReport(matcher, report);
				if (matches) {
					matchedDirectives.add(directive);
				}
				return matches;
			});

			const rangeMatched = selectionMatchesDirectiveRanges(
				directiveRanges,
				report,
			);

			// This tracks which directives actually suppressed reports
			if (rangeMatched) {
				// Find which specific range(s) matched this report
				for (const range of directiveRanges) {
					if (
						range.lines.begin <= report.range.begin.line &&
						range.lines.end >= report.range.begin.line &&
						range.selections.some((selection) =>
							selectionMatchesReport(selection, report),
						)
					) {
						// This range matched - find directives that contributed to creating it
						for (const directive of this.#directivesForRanges) {
							const directiveLine = directive.range.begin.line;

							// Check if directive's selections overlap with range's selections
							const hasMatchingSelection = directive.selections.some((sel) =>
								range.selections.some((rangeSel) => rangeSel.test(sel)),
							);

							if (!hasMatchingSelection) {
								continue;
							}

							if (directive.type === "disable-lines-begin") {
								// Checks if this directive started the range
								if (directiveLine + 1 === range.lines.begin) {
									matchedDirectives.add(directive);
								}
							} else if (directive.type === "disable-lines-end") {
								// Checks if this directive ended the range
								if (directiveLine === range.lines.end) {
									matchedDirectives.add(directive);
								}
							} else {
								// Handles just the disable-next-line case
								if (
									directiveLine + 1 >= range.lines.begin &&
									directiveLine + 1 <= range.lines.end
								) {
									matchedDirectives.add(directive);
								}
							}
						}
					}
				}
			}

			return !fileMatched && !rangeMatched;
		});

		const unusedDirectives = [
			...this.#directivesForFile,
			...this.#directivesForRanges,
		].filter((directive) => !matchedDirectives.has(directive));

		return {
			reports: filteredReports,
			unusedDirectives,
		};
	}
}
