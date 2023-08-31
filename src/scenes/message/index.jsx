import { Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import ChatInput from "components/ChatInput";
import UserImage from "components/UserImage";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const Message = () => {
  const socket = io("https://my-linkedin-clone-backend.onrender.com")
  const isNonMobileScreen = useMediaQuery("(min-width:1000px)");
  const [chatToName, setChatToName] = useState("");
  const [chatToPic, setChatToPic] = useState("");
  const [messages, setMessages] = useState([]);
  const [sentMsg, setSentMsg] = useState(null);
  const user = useSelector((state) => state.user);
  const { userId } = useParams();
  const token = useSelector((state) => state.token);

  const getUser = async () => {
    const response = await fetch(`https://my-linkedin-clone-backend.onrender.com/users/${userId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setChatToName(`${data.firstName} ${data.lastName}`);
    setChatToPic(data.picturePath);
  };

  const getMessage = async () => {
    const msgResponse = await fetch("https://my-linkedin-clone-backend.onrender.com/message/getmsg", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: user._id,
        to: userId,
      }),
    });
    const msg = await msgResponse.json();
    setMessages(msg);
  };

  const handleSendMsg = async (msg) => {
    await fetch("https://my-linkedin-clone-backend.onrender.com/message/addmsg", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: user._id,
        to: userId,
        message: msg,
      }),
    });
    socket.emit("send-msg", msg, userId);

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    getUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getMessage();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    sentMsg && setMessages((prev) => [...prev, sentMsg]);
  }, [sentMsg]);

  useEffect(() => {
    socket.on("received-msg", (msg, receiverId) => {
      if (receiverId === user._id) {
        console.log(receiverId, user._id)
        setSentMsg({ fromSelf: false, message: msg });
      }
    });
  }, []);


  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "1rem",
        alignItems: "center",
        backgroundColor: "#131324",
      }}
    >
      <Box
        height="85vh"
        width="85vw"
        backgroundColor="#00000076"
        display="grid"
        // gridTemplateColumns={isNonMobileScreen ? "35% 65%" : "25% 75%"}
      >
        <Box
          display="grid"
          gap="0.1rem"
          overflow="hidden"
          gridTemplateRows={isNonMobileScreen ? "10% 80% 10%" : "15% 70% 15%"}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            padding="0 2rem"
          >
            <Box display="flex" alignItems="center" gap="1rem">
              <Box>
                <UserImage image={chatToPic} size="40px" />
              </Box>
              <Box color="white">
                <p>{chatToName}</p>
              </Box>
            </Box>
          </Box>

          <Box
            padding="1rem 2rem"
            display="flex"
            flexDirection="column"
            gap="1rem"
            overflow="auto"
          >
            {messages.map((message) => {
              return (
                <Box>
                  {message.fromSelf ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-end"
                    >
                      <Box
                        maxWidth="40%"
                        padding="1rem"
                        fontSize="1.1rem"
                        borderRadius="1rem"
                        color="#d1d1d1"
                        sx={{
                          overflowWrap: "break-word",
                          backgroundColor: "#4f04ff21",
                        }}
                      >
                        <p>{message.message}</p>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-start"
                    >
                      <Box
                        maxWidth="40%"
                        padding="1rem"
                        fontSize="1.1rem"
                        borderRadius="1rem"
                        color="#d1d1d1"
                        sx={{
                          overflowWrap: "break-word",
                          backgroundColor: "#9900ff20",
                        }}
                      >
                        <p>{message.message}</p>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
          <ChatInput handleSendMsg={handleSendMsg} />
        </Box>
      </Box>
    </Box>
  );
};

export default Message;
