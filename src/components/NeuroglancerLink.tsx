import { Box, createStyles, Link, Button } from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React, {useContext } from "react";
import { Dataset, DatasetView, Volume } from "../api/datasets";
import { AppContext } from "../context/AppContext";
import LaunchIcon from "@material-ui/icons/Launch";
import WarningIcon from "@material-ui/icons/Warning";

const useStyles = makeStyles(theme => ({
  root: {flexGrow: 1,
        fontFamily: "'Proxima Nova W01',Arial,Helvetica,sans-serif"},

  link: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    fontSize: 12
  }
}));

type NeuroglancerLinkProps = {
    dataset: Dataset;
    view: DatasetView
    checkState: Map<string, boolean>;
  };


export default function NeuroglancerLink({dataset, view, checkState}: NeuroglancerLinkProps){
    const classes = useStyles();
    const [appState,] = useContext(AppContext);
    const neuroglancerAddress = appState.neuroglancerAddress;
    const webGL2Enabled = appState.webGL2Enabled;
    
    const local_view = {...view};
    local_view.volumeKeys = [];
    //console.log(checkState)
    dataset.volumes.forEach((value: Volume, key: string) => {
      if (checkState.get(key)) { local_view.volumeKeys.push(key) }
    });
    
  
    if (local_view.volumeKeys.length === 0) { return <div> No layers selected </div> }
    else {
      return (
        <Box>
          <Button
            className={classes.link}
            href={`${neuroglancerAddress
              }${dataset.makeNeuroglancerViewerState(local_view)}`}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<LaunchIcon fontSize="small" />}
          >
            View
        </Button>
          {!webGL2Enabled && <WarningIcon />}
        </Box>
      );
    }
  };