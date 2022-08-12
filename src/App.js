import React from "react"; // used to import react functionalities in current .js file

import { Tree, TreeNode } from "react-organizational-chart"; // the library that is used to create chart
import _ from "lodash"; // a javascript library used to perform js functions like map and filter 
import clsx from "clsx";
import Card from "@material-ui/core/Card";
// material UI is a library used to get some predefined components like cards used in the chart
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import BusinessIcon from "@material-ui/icons/Business";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import Avatar from "@material-ui/core/Avatar";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Badge from "@material-ui/core/Badge";
import Tooltip from "@material-ui/core/Tooltip";


// these are the libraries that provides drag and drop feature *
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDrag, useDrop } from "react-dnd";

//this is the json file where the hierarchical order of company is stored
import organization from "./org.json";


import {
  createMuiTheme,
  makeStyles,
  ThemeProvider
} from "@material-ui/core/styles";


// styling the cards *
const useStyles = makeStyles((theme) => ({
  root: {
    background: "white", // setting backgroud color of card to white
    display: "inline-block", // it means that our card will only take the space according to its width, block means it will take the space of entire line
    borderRadius: 16 // used to set border radius of card
  },
  expand: {
    transform: "rotate(0deg)", // means when we close the card by clicking on up arrow then that down arrow must align itself on a 0 degree angle
    // margin is a styling property used to maintain spacing between elements
    marginTop: -10,
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.short
    })
  },
  expandOpen: {
    transform: "rotate(180deg)" // signifies that when up arrow is clicked rotate it by 180deg in order to convert it to down arrow
  },
  avatar: {
    backgroundColor: "#ECECF4" // used to set background of account icon
  }
}));

// logic to compile parent and child nodes by connecting them with edges
function Organization({ org, onCollapse, collapsed }) {
  const classes = useStyles();

  const [{ canDrop, isOver }, drop] = useDrop({
    accept: "account",
    drop: () => ({ name: org.tradingName }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });
  const isActive = canDrop && isOver;
  let backgroundColor = "white";
  if (isActive) {
    backgroundColor = "#ddffd2";
  } else if (canDrop) {
    backgroundColor = "#ffeedc";
  }
  return (
    <Card
      variant="outlined"  
      className={classes.root}
      ref={drop}
      style={{ backgroundColor }}
    >
      <CardHeader
        avatar={
            <Badge
              style={{ cursor: "pointer" }}
              color="secondary"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right"
              }}
              showZero
              invisible={!collapsed}
              overlap="circle"
              badgeContent={_.size(org.organizationChildRelationship)}
              onClick={onCollapse}
            >
              <Avatar className={classes.avatar}>
                <BusinessIcon color="primary" />
              </Avatar>
            </Badge>
         
        }
        title={org.tradingName}

      />


      <IconButton
        size="small"
        onClick={onCollapse}
        className={clsx(classes.expand, {
          [classes.expandOpen]: !collapsed
        })}
      >
        <ExpandMoreIcon />
      </IconButton>
    </Card>
  );
}
function Account({ a }) {
  const classes = useStyles();
  const [{ isDragging }, drag] = useDrag({
    type:"Card",
    item: { name: a.name, type: "account" },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        alert(`You moved ${item.name} to ${dropResult.name}`);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  // used for styling *
  const opacity = isDragging ? 0.4 : 1;
  return (
    <Card
      variant="outlined"
      className={classes.root}
      ref={drag}
      style={{ cursor: "pointer", opacity }}
    >
      <CardHeader
        avatar={
          <Avatar className={classes.avatar}>
            <AccountBalanceIcon color="secondary" />
          </Avatar>
        }
        title={a.name}
      />
    </Card>
  );
}


// used for styling *
function Product({ p }) {
  const classes = useStyles();
  return (
    <Card variant="outlined" className={classes.root}>
      <CardContent>
        <Typography variant="subtitle2">{p.name}</Typography>
      </CardContent>
    </Card>
  );
}

function Node({ o, parent }) {
  // state is use to store the value of a variable on a permanent basis, means if you won't change it , it will remain same (even if you reload the page in contrast of traditional javascript in which the value of variable is lost when page is loaded).
  // collapse variable basically handles the logic that whether to show the childrens of parent node or not.
  const [collapsed, setCollapsed] = React.useState(o.collapsed);
  const handleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // use effect is just like a default constructor which is called only once when program is loaded.
  React.useEffect(() => {
    o.collapsed = collapsed;
  });


// parent node would always be visible so we don't need to modify it according to the value of collapse variable
  const T = parent
    ? TreeNode
    : (props) => (
        <Tree
          {...props}
          lineWidth={"2px"}
          lineColor={"#bbc"}
          lineBorderRadius={"12px"}
        >
          {props.children}
        </Tree>
      );
// child nodes would be visible only if collapse value is false 
  return collapsed ? (
    // signifies the logic to hide child nodes
    <T
      label={
        <Organization
          org={o}
          onCollapse={handleCollapse}
          collapsed={collapsed}
        />
      }
    />
  ) : (
    // shows child nodes
    <T
      label={
        <Organization
          org={o}
          onCollapse={handleCollapse}
          collapsed={collapsed}
        />
      }
    >
      {_.map(o.account, (a) => (
        <TreeNode label={<Account a={a} />}>
          <TreeNode label={<Product p={a.product} />} /> 
        </TreeNode>
      ))}
      {_.map(o.organizationChildRelationship, (c) => (
        <Node o={c} parent={o} />
      ))}
    </T>
  );
}
const theme = createMuiTheme({

  fontFamily: "Roboto, sans-serif"
});

export default function App(props) {
  // these are some default properties of Material UI, like Themeprovider, Box totally used for designing prospects *
  return (
    <ThemeProvider theme={theme}>
      <Box bgcolor="background" padding={4} height="80vh">
        <DndProvider backend={HTML5Backend}>
          <Node o={organization} />
        </DndProvider>
      </Box>
    </ThemeProvider>
  );
}
