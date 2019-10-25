import React from "react";
import { Document, Page } from "react-pdf/dist/entry.webpack";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "./ScholarReader.scss";
import { AnnotatedPage } from "./AnnotatedPage";
import { citations } from "./citations";
import { Summaries } from "./semanticScholar";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

interface ScholarReaderProps {
  pdfUrl: string | undefined;
  summaries: Summaries;
}

interface ScholarReaderState {
  numPages: number | null;
  pageNumber: number;
}

const theme = createMuiTheme({
  palette: {
    type: "light"
  }
});

/*
 * Based on example code from the react-pdf project,
 * https://github.com/wojtekmaj/react-pdf
 * Sample code is under MIT license.
 */
class ScholarReader extends React.Component<ScholarReaderProps, ScholarReaderState> {
  constructor(props: ScholarReaderProps) {
    super(props);
    this.state = {
      numPages: null,
      pageNumber: 1
    };
  }

  onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(numPages);
    this.setState({ numPages });
  };

  render() {
    const { numPages } = this.state;

    return (
      <MuiThemeProvider theme={theme}>
        <div className="ScholarReader">
          <div className="ScholarReader__container">
            <div className="ScholarReader__container__document">
              <Document
                file={this.props.pdfUrl}
                onLoadSuccess={this.onDocumentLoadSuccess.bind(this)}
              >
                {Array.from(new Array(numPages), (_, index) => (
                  <AnnotatedPage
                    key={`page_${index + 1}`}
                    index={index}
                    citations={citations(this.props.pdfUrl, index + 1)}
                    summaries={this.props.summaries}
                  />
                ))}
              </Document>
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default ScholarReader;