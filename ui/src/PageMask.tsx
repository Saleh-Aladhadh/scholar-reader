import React from "react";
import * as selectors from "./selectors";
import { ScholarReaderContext } from "./state";
import { Sentence } from "./types/api";

interface PageMaskProps {
  pageNumber: number;
  pageWidth: number;
  pageHeight: number;
}

export class PageMask extends React.PureComponent<PageMaskProps> {
  static contextType = ScholarReaderContext;
  context!: React.ContextType<typeof ScholarReaderContext>;

  render() {
    const maskId = `page-${this.props.pageNumber}-mask`;

    const {
      selectedEntityType,
      selectedEntityId,
      symbols,
      mathMls,
      sentences,
    } = this.context;

    /*
     * Only show the mask if a symbol is selected and sentences were detected for the paper.
     */
    if (
      selectedEntityType !== "symbol" ||
      selectedEntityId === null ||
      symbols === null ||
      mathMls === null ||
      sentences === null ||
      sentences.all.length === 0
    ) {
      return null;
    }

    const matchingSentenceIds: string[] = [];
    selectors
      .matchingSymbols(selectedEntityId, symbols, mathMls)
      .forEach((matchingSymbolId) => {
        const sentenceId = symbols.byId[matchingSymbolId].sentence;
        if (
          sentenceId !== null &&
          matchingSentenceIds.indexOf(sentenceId) === -1
        ) {
          matchingSentenceIds.push(sentenceId);
        }
      });
    const matchingSentences = matchingSentenceIds.map(
      (sentenceId) => sentences.byId[sentenceId]
    );
    const firstMatchingSentence: Sentence | undefined = matchingSentences[0];

    const { pageWidth, pageHeight } = this.props;
    return (
      <svg width={pageWidth} height={pageHeight}>
        <mask id={maskId}>
          {/*
           * Where the SVG mask is white, the overlay mask will show. Start by showing the
           * mask everywhere, and subtract from it. Setting the fill to "white" sets the
           * initial mask area as the entire page. Setting the fill to "black" (as with the
           * rectangles below) subtracts from the mask.
           */}
          <rect
            key="entire-page-mask"
            width={pageWidth}
            height={pageHeight}
            fill="white"
          />
          {/*
           * Subtract from the mask wherever a sentence should be activated.
           */}
          {matchingSentences
            .map((s) => {
              return s.bounding_boxes
                .filter((b) => b.page === this.props.pageNumber - 1)
                .map((b) => (
                  <rect
                    key={b.id}
                    x={b.left * pageWidth}
                    y={b.top * pageHeight}
                    width={b.width * pageWidth}
                    height={b.height * pageHeight}
                    fill="black"
                  />
                ));
            })
            /*
             * Flatten all masks generated for each bounding box into single list.
             */
            .flat()}
        </mask>
        {/* Show a white mask the page anywhere a sentence rectangle wasn't added above. */}
        <rect
          key="white-overlay"
          width={pageWidth}
          height={pageHeight}
          fill={"white"}
          opacity={0.5}
          mask={`url(#${maskId})`}
        />
        {/* Highlight the first sentence in the document where the symbol appears. */}
        {firstMatchingSentence !== undefined && (
          <>
            {firstMatchingSentence.bounding_boxes
              .filter((b) => b.page === this.props.pageNumber - 1)
              .map((b) => (
                <rect
                  key={b.id}
                  x={b.left * pageWidth}
                  y={b.top * pageHeight}
                  width={b.width * pageWidth}
                  height={b.height * pageHeight}
                  fill="green"
                  opacity={0.2}
                />
              ))}
          </>
        )}
      </svg>
    );
  }
}

export default PageMask;
