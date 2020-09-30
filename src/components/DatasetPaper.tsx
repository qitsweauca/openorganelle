import { Link as RouterLink } from 'react-router-dom';
import { Paper, Grid, Divider, CardActionArea, CardMedia, createStyles, makeStyles } from "@material-ui/core";
import React, {useContext, useState } from "react";
import { Dataset, DatasetView } from "../api/datasets";
import { AppContext } from "../context/AppContext";
import DatasetDescriptionText from "./DatasetDescriptionText";
import DatasetViewList from "./DatasetViewList";
import LayerCheckboxList from "./LayerCheckboxList";
import NeuroglancerLink from "./NeuroglancerLink";

type DatasetPaperProps = {
    datasetKey: string;
  };
  
interface CheckStates {
    layerCheckState: Map<string, boolean>
    viewCheckState: boolean[]
}

  const useStyles: any = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2),
      textAlign: "left",
      color: theme.palette.text.secondary,
      margin: theme.spacing(2)
    },
    grid: {},
    formcontrol: {
      margin: theme.spacing(1)
    },
    formgroup: {},
    datasetthumbnail: {
    },
    hyperlink: {
      color: theme.palette.info.main
    }
  })
);


export default function DatasetPaper({ datasetKey }: DatasetPaperProps){
    const classes = useStyles();
    const [appState,] = useContext(AppContext);
    const dataset: Dataset = appState.datasets.get(datasetKey);
    // initialize the layer checkboxes by looking at the first dataset view
    
    const layerCheckStateInit = new Map<string, boolean>([...dataset.volumes.keys()].map(k => {
      let vkeys = dataset.views[0].volumeKeys;
      if (vkeys.includes(k)) {
        return [k, true]
      }
      else {
        return [k, false]
      }
    }));
  
    // the first view is selected, by default
    const viewCheckStateInit = dataset.views.map((v, idx) => idx === 0);  
    
    const [checkStates, setCheckStates] = useState({layerCheckState: layerCheckStateInit, viewCheckState: viewCheckStateInit})
    
    const handleLayerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newCheckState = new Map(
        checkStates.layerCheckState.set(event.target.name, event.target.checked).entries()
      );
      // Prevent all checkboxes from being deselected
      if (![...newCheckState.values()].every(v => !v)) {
        setCheckStates({...checkStates, layerCheckState: newCheckState});
      }
    };
  
    const handleViewChange = (event: React.ChangeEvent<HTMLInputElement>, views: DatasetView[]) => {
      // Only handle selected -> unselected event
      if (event.target.checked === true) {
      
        const newCheckState: bool[] = checkStates.viewCheckState.map(() => false);
        newCheckState[parseInt(event.target.name)] = event.target.checked;
    
        const newLayerState = new Map([...checkStates.layerCheckState.entries()].map(([k, v]) => [k, false]));      
        views[newCheckState.findIndex((v) => v)].volumeKeys.map(k => newLayerState.set(k, true));
  
        setCheckStates({...checkStates, layerCheckState: newLayerState, viewCheckState: newCheckState});
        // reset the state of layer selection checkboxes 
      }
    };
  
    const datasetLink = `/datasets/${dataset.key}`;
  
    return (
      <Paper className={classes.paper}>
        <Grid
          container
          className={classes.grid}
          spacing={2}
          direction="row"
          justify="space-around"
          alignItems="stretch"
        >
          <Grid item xs={4}>
            <DatasetDescriptionText datasetDescription={dataset.description} titleLink={datasetLink} />
          </Grid>
          <Divider orientation="vertical" flexItem={true}></Divider>
          <Grid
            item
            container
            direction="column"
            xs={4}
            spacing={2}
            justify="flex-end"
          >
            <Grid item>
              <LayerCheckboxList
                dataset={dataset}
                checkState={checkStates.layerCheckState}
                handleChange={handleLayerChange}
              />
            </Grid>
            <Grid item>
              <NeuroglancerLink
                dataset={dataset}
                checkState={checkStates.layerCheckState}
                view={dataset.views[checkStates.viewCheckState.findIndex(a => a)]}
              />
            </Grid>
          </Grid>
          <Divider orientation="vertical" flexItem={true}></Divider>
          <Grid item xs={4}>
            <CardActionArea component={RouterLink} to={datasetLink}>
              <CardMedia
                style={{ height: 256, width: 256, borderRadius: "10%" }}
                image={dataset.thumbnailPath}
              />
            </CardActionArea>
          </Grid>
          <DatasetViewList
           views={dataset.views} 
           handleChange={(e) => handleViewChange(e, dataset.views)} 
           checkState={checkStates.viewCheckState}>
          </DatasetViewList>
        </Grid>
      </Paper>
    );
  };
  