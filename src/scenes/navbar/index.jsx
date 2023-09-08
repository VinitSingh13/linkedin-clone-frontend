import * as React from "react";
import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Badge,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import {
  Search,
  Message,
  DarkMode,
  LightMode,
  Notifications,
  Help,
  Menu,
  Close,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";
// import { socket } from "socket";

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isNonMobileScreen = useMediaQuery("(min-width:1000px)");
  const [invisible, setInvisible] = useState(false);
  const [displayMsg, setDisplayMsg] = useState(false);
  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;
  const fullName = `${user.firstName} ${user.lastName}`;
  const [messages, setMessages] = useState([]);
  const [sentMsg, setSentMsg] = useState(null);
  const token = useSelector((state) => state.token);

  const showMessage = () => {
    setDisplayMsg(!displayMsg);
    setInvisible(!invisible);
  };

  const updateMsgStatus = async (senderId) => {
    const res = await fetch(
      `https://my-linkedin-clone-backend.onrender.com/message/updatestatus/${senderId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  };

  const messageStatusHandler = (senderId) => {
    updateMsgStatus(senderId);
    navigate(`/message/${senderId}`);
  };

  const getMsgAndUser = async () => {
    const response = await fetch(
      `https://my-linkedin-clone-backend.onrender.com/message/msgAndUserInfo/${user._id}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    const newData = data.map((res) => {
      return {
        counter: res.count,
        senderId: res._id,
        msg: res.first.message.text,
        senderInfo: res.first.userInfo[0],
      };
    });
    console.log(newData);
    setMessages(newData);
  };

  useEffect(() => {
    if (messages.length === 0) {
      sentMsg && setMessages((prev) => [...prev, sentMsg]);
    } else {
      if (sentMsg.msg.length === 0) return;
      const msgExists = messages.some(
        (msg) => msg.senderId === sentMsg.senderId
      );
      if (!msgExists) {
        setMessages((prev) => [...prev, sentMsg]);
      } else {
        setMessages((prev) =>
          prev.map((message) => {
            if (message.senderId === sentMsg.senderId) {
              return {
                ...message,
                msg: sentMsg.msg,
                counter: message.counter + 1,
              };
            } else {
              return message;
            }
          })
        );
      }
    }
  }, [sentMsg]);

  useEffect(() => {
    const socket = io("https://my-linkedin-clone-backend.onrender.com");
    getMsgAndUser();
    socket.on("received-msg", (msg, receiverId, senderId) => {
      socket.on("share-sender-info", (senderInfo) => {
        if (receiverId === user._id) {
          // getMsgAndUser();
          setSentMsg({ msg, senderId, senderInfo, counter: 1 });
        }
      });
    });
  }, []);

  return (
    <FlexBetween padding="1rem 6%" backgroundColor={alt}>
      <FlexBetween gap="1.75rem">
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          Social Media
        </Typography>
        {isNonMobileScreen && (
          <FlexBetween
            backgroundColor={neutralLight}
            borderRadius="9px"
            gap="3rem"
            padding="0.1rem 1.5rem"
          >
            <InputBase placeholder="Search..." />
            <IconButton>
              <Search />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>
      {isNonMobileScreen ? (
        <FlexBetween gap="2rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkMode sx={{ fontSize: "25px" }} />
            ) : (
              <LightMode sx={{ color: dark, fontSize: "25px" }} />
            )}
          </IconButton>

          <Box position="relative">
            <Box>
              <IconButton
                disabled={messages.length > 0 ? false : true}
                onClick={showMessage}
              >
                <Badge
                  color="error"
                  variant="dot"
                  invisible={messages.length > 0 ? false : true}
                >
                  <Message sx={{ fontSize: "25px" }} />
                </Badge>
              </IconButton>
            </Box>
            {messages.length > 0 ? (
              <Box
                position="absolute"
                width="265px"
                sx={{
                  display: `${displayMsg ? "block" : "none"}`,
                }}
              >
                <List
                  sx={{
                    height: "400px",
                    bgcolor: "ButtonText",
                    overflow: "auto",
                  }}
                >
                  {messages.map((message) => {
                    return (
                      <ListItem
                        disablePadding
                        onClick={() => messageStatusHandler(message.senderId)}
                      >
                        <ListItemButton>
                          <ListItemAvatar>
                            <Avatar
                              src={`https://my-linkedin-clone-backend.onrender.com/assets/${message.senderInfo.picturePath}`}
                            ></Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${message.senderInfo.firstName} ${message.senderInfo.lastName}`}
                            secondary={
                              <Typography
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: "1",
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {`${message.msg}`}
                              </Typography>
                            }
                          />
                          <Avatar
                            sx={{ width: 20, height: 20, color: "white" }}
                          >
                            {message.counter}
                          </Avatar>
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ) : null}
          </Box>

          <Notifications sx={{ fontSize: "25px" }} />
          <Help sx={{ fontSize: "25px" }} />
          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={{
                backgroundColor: neutralLight,
                width: "150px",
                borderRadius: "0.25rem",
                p: "0.25rem 1rem",
                "& .MuiSvgIcon-root": {
                  pr: "0.25rem",
                  width: "3rem",
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutralLight,
                },
              }}
              input={<InputBase />}
            >
              <MenuItem value={fullName}>
                <Typography>{fullName}</Typography>
              </MenuItem>
              <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <IconButton
          onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
        >
          <Menu />
        </IconButton>
      )}
      {!isNonMobileScreen && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="10"
          maxWidth="500px"
          minWidth="300px"
          backgroundColor={background}
        >
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <Close />
            </IconButton>
          </Box>
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
          >
            <IconButton
              onClick={() => dispatch(setMode())}
              sx={{ fontSize: "25px" }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <IconButton onClick={() => setInvisible(!invisible)}>
              <Badge color="error" variant="dot" invisible={invisible}>
                <Message sx={{ fontSize: "25px" }} />
              </Badge>
            </IconButton>

            <Notifications sx={{ fontSize: "25px" }} />
            <Help sx={{ fontSize: "25px" }} />
            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backgroundColor: neutralLight,
                  width: "150px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={() => dispatch(setLogout())}>
                  Log Out
                </MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}
    </FlexBetween>
  );
};

export default Navbar;
