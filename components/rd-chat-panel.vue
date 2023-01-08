<template>
  <div class="rd-panel" ref="rdPanel">
    <div class="rd-chat-header">
      <div class="rd-chat-button" @click="emits('close-chat', 'chat-list')">
        <rd-svg class="rd-chat-button-icon" name="arrow-left" />
      </div>
      <div class="rd-chat-detail-container">
        <span class="rd-chat-name rd-headline-4">{{ data.chat.title }}</span>
        <span
          v-if="data.chat.type === 'group'"
          class="rd-chat-caption rd-caption-text"
          >{{
            `${data.chat.member?.length} participant${
              data.chat.member?.length > 1 ? "s" : ""
            }`
          }}</span
        >
      </div>
      <div
        class="rd-chat-button"
        @click="emits('close-chat', null)"
        style="position: absolute; right: 27px"
      >
        <rd-svg class="rd-chat-button-icon" name="close" />
      </div>
    </div>
    <div class="rd-chat-body" ref="rdChatBody">
      <div
        v-for="(group, i) in groups"
        :key="group.date.getTime()"
        class="rd-chat-group"
        :data-unread="group.unread"
      >
        <div
          v-for="(message, j) in group.messages"
          :key="message._id"
          class="rd-chat-message rd-chat-message-container"
          :class="message.from._id === '0' ? 'rd-chat-message-self' : ''"
        >
          <rd-chat
            :message="message"
            :self="message.from._id === '0'"
            :color="colorHandler(message.from._id)"
            :name="group.messages[j + 1]?.from._id !== message.from._id"
            :type="data.chat.type"
            @delete="deleteHandler"
            @edit="editHandler"
            @reply="replyHandler"
            @share="shareHandler"
          />
        </div>
        <div
          v-if="i !== groups.length - 1"
          class="rd-chat-divider"
          :class="group.unread ? 'rd-chat-divider-unread' : ''"
        >
          <span class="rd-chat-information rd-headline-4">{{
            group.unread ? "New Message" : dateHandler(group.date)
          }}</span>
        </div>
        <div
          v-else
          class="rd-chat-padding"
          style="position: relative; width: 100%; height: 6px"
        ></div>
      </div>
      <div
        ref="rdMessageDividerDecoy"
        v-if="messageDecoy?.divider"
        class="rd-chat-divider rd-chat-divider-decoy"
      >
        <span class="rd-chat-information rd-headline-4">Today</span>
      </div>
      <div
        ref="rdMessageDecoy"
        v-if="messageDecoy"
        class="rd-chat-message rd-chat-message-decoy"
        :class="messageDecoy.from._id === '0' ? 'rd-chat-message-self' : ''"
      >
        <rd-chat
          :message="messageDecoy"
          :self="messageDecoy.from._id === '0'"
          :color="colorHandler(messageDecoy.from._id)"
          :name="!messageDecoy.same"
        />
      </div>
      <div
        class="rd-chat-scroll"
        :class="scroll >= 230 ? 'rd-chat-scroll-visible' : ''"
        @click="scrollToBottom"
      >
        <span class="rd-chat-scroll-text rd-headline-4">New Message</span>
        <div class="rd-chat-scroll-icon-container">
          <rd-svg
            class="rd-chat-scroll-icon"
            name="arrow-down"
            color="primary"
          />
        </div>
      </div>
    </div>
    <form class="rd-chat-footer" ref="rdChatFooter" @submit="sendHandler">
      <div
        v-if="loading && data.chat?.type === 'individual'"
        class="rd-chat-loading"
        ref="rdChatLoading"
      >
        <div class="rd-chat-loading-wrapper">
          <div class="rd-chat-loading-container">
            <div class="rd-chat-loading-spinner">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
            <span class="rd-chat-loading-text rd-body-text"
              >Please wait while we connect you with one of our team ...</span
            >
          </div>
        </div>
        <div class="rd-chat-loading-wrapper">
          <div class="rd-chat-loading-container">
            <span class="rd-chat-loading-text rd-body-text">Connected!</span>
          </div>
        </div>
      </div>
      <div v-if="messageReply || messageEdit" class="rd-chat-reply">
        <span class="rd-chat-reply-from rd-headline-5">{{
          messageReply
            ? `Replying to ${messageReply.from.name}`
            : "Editing your message"
        }}</span>
        <span class="rd-chat-reply-message rd-body-text">{{
          messageReply?.text || messageEdit?.text
        }}</span>
        <div class="rd-chat-reply-close" @click="deleteReply">
          <rd-svg class="rd-chat-reply-button-icon" name="close" />
        </div>
      </div>
      <rd-input-text
        :input="messageInput"
        class="rd-chat-input"
        style="width: calc(100% - 89px); z-index: 2"
      />
      <rd-input-button
        label="Send"
        class="rd-chat-input"
        style="width: 76px"
        @clicked="sendHandler"
        :disabled="!message || loading"
      />
    </form>
  </div>
</template>

<script lang="ts" setup>
  import { gsap } from "gsap";
  import { ScrollToPlugin } from "gsap/ScrollToPlugin";
  import { ComputedRef } from "vue";
  import { Chat, ChatMessage, InputOption } from "../interfaces/general";

  interface ChatMessageDecoy extends ChatMessage {
    divider?: boolean;
    same?: boolean;
  }

  const emits = defineEmits(["close-chat"]);
  const props = defineProps<{
    state: "show" | "hide";
    data: {
      chat: Chat;
    };
  }>();
  const {
    loadMessages,
    sendMessage,
    editMessage,
    readMessages,
    deleteMessage,
    generateMessageId,
  } = useChat();

  const scroll = ref<number>(0);
  const loading = ref<boolean>(true);
  const groups = ref<
    {
      unread?: boolean;
      date: Date;
      messages: ChatMessage[];
    }[]
  >(null);

  const rdPanel = ref<HTMLDivElement>(null);
  const rdChatContainer = ref<HTMLDivElement>(null);
  const rdChatOverlay = ref<HTMLDivElement>(null);
  const rdChatBody = ref<HTMLDivElement>(null);
  const rdChatFooter = ref<HTMLFormElement>(null);
  const rdMessageDividerDecoy = ref<HTMLDivElement>(null);
  const rdMessageDecoy = ref<HTMLDivElement>(null);
  const rdChatLoading = ref<HTMLDivElement>(null);

  const messageInput = ref<InputOption>({
    name: "message",
    placeholder: "Type a new message",
    model: "",
  });
  const messageDecoy = ref<ChatMessageDecoy>(null);
  const messageTimeout = ref<NodeJS.Timeout>(null);
  const messageReply = ref<ChatMessage["reply"]>(null);
  const messageEdit = ref<{
    _id: string;
    text: string;
  }>(null);

  const message: ComputedRef<string> = computed(() => messageInput.value.model);

  const months: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const animate = {
    init(rdPanel: HTMLElement): void {
      const tl: GSAPTimeline = gsap.timeline();

      tl.to(rdPanel, {
        opacity: 1,
        scale: 1,
        ease: "power2.inOut",
        duration: 0.375,
      });
    },
    exit(rdPanel: HTMLElement): void {
      const tl: GSAPTimeline = gsap.timeline();

      tl.to(rdPanel, {
        opacity: 0,
        scale: 0.875,
        ease: "power2.inOut",
        duration: 0.375,
      });
    },
    sendMessage(
      offset: number,
      rdMessageDecoy: HTMLElement,
      rdMessageDividerDecoy: HTMLElement,
      rdChatBody: HTMLElement,
      cb?: () => void
    ): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          setTimeout(() => {
            gsap.to(rdGroups, {
              y: 0,
              duration: 0,
            });
            gsap.to(rdChatBody, {
              overflowY: "auto",
              duration: 0,
            });
            if (rdChatMessages) {
              gsap.to(rdChatMessages, {
                y: 0,
                duration: 0,
              });
            }
            cb();
          }, 250);
        },
        paused: true,
      });

      const offsetY: number =
        rdMessageDecoy?.getBoundingClientRect()?.height || 0;

      const rdGroups: HTMLElement[] = gsap.utils.toArray(
        rdChatBody.querySelectorAll(".rd-chat-group")
      );
      let rdChatMessages: HTMLElement[] = null;
      let rdChatDivider: HTMLElement = null;

      if (!offset) {
        if (rdMessageDividerDecoy) {
          rdMessageDividerDecoy.style.bottom = `${offsetY}px`;
        }

        tl.to([rdMessageDecoy, rdMessageDividerDecoy], {
          opacity: 1,
          duration: 0.25,
          ease: "power2.inOut",
        });

        const unread: boolean = rdGroups[0]?.dataset.unread === "true";
        for (const rdGroup of rdGroups) {
          if (unread) {
            if (rdGroup.dataset.unread == "true") {
              rdChatMessages = gsap.utils.toArray(
                rdGroup.querySelectorAll(".rd-chat-message-container")
              );
              rdChatDivider = rdGroup.querySelector(".rd-chat-divider");

              tl.to(
                rdChatMessages,
                {
                  y: -offsetY - (rdMessageDividerDecoy ? 29 : 0),
                  duration: 0.25,
                  ease: "power2.inOut",
                },
                "<0"
              ).to(
                rdChatDivider,
                {
                  y: -offsetY - (rdMessageDividerDecoy ? 17 : 0),
                  opacity: 0,
                  duration: 0.25,
                  ease: "power2.inOut",
                },
                "<0"
              );
            } else {
              tl.to(
                rdGroup,
                {
                  y: -offsetY,
                  duration: 0.25,
                  ease: "power2.inOut",
                },
                "<0"
              );
            }
          } else {
            tl.to(
              rdGroup,
              {
                y: -offsetY - (rdMessageDividerDecoy ? 29 : 0),
                duration: 0.25,
                ease: "power2.inOut",
              },
              "<0"
            );
          }
        }
      } else {
        gsap.to(rdChatBody, {
          overflowY: "visible",
          duration: 0,
        });
        gsap.to(rdMessageDecoy, {
          top: `calc(100% + ${rdMessageDividerDecoy ? 27 : 0}px - ${
            offset > 0 ? offset : 0
          }px)`,
          bottom: "auto",
          duration: 0,
        });
        if (rdMessageDividerDecoy) {
          gsap.to(rdMessageDividerDecoy, {
            top: "100%",
            bottom: "auto",
            duration: 0,
          });
        }

        tl.to([rdMessageDecoy, rdMessageDividerDecoy], {
          opacity: 1,
          duration: 0.25,
          ease: "power2.inOut",
        });

        if (offset > 0) {
          tl.to(
            rdGroups,
            {
              y: -offset,
              duration: 0.25,
              ease: "power2.inOut",
            },
            "<0"
          );
        }
      }

      return tl;
    },
  };

  function dateHandler(x: Date): string {
    const currentDate: number = new Date().setHours(0, 0, 0, 0);
    if (currentDate === x.setHours(0, 0, 0, 0)) return "Today";

    const year: number = x.getFullYear();
    const month: number = x.getMonth();
    const date: number = x.getDate();

    return `${months[month]} ${date.toString().padStart(2, "0")}, ${year}`;
  }
  function hoursHandler(x: Date): string {
    const hours: number = x.getHours();
    const minutes: number = x.getMinutes();

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  function colorHandler(_id: string): [string, string] {
    let str: [string, string] = ["#2f80ed", "#f8f8f8"];

    if (props.data.chat.type === "group") {
      const index: number = props.data.chat.member?.findIndex(
        (a) => a._id === _id
      );
      if (index > -1)
        str = [
          props.data.chat.member[index].name_color,
          props.data.chat.member[index].background_color,
        ];
    }

    return str;
  }
  function scrollHandler(e: Event): Event {
    if (e.target instanceof HTMLElement) {
      scroll.value = Math.abs(e.target.scrollTop);
    }
    return e;
  }

  function deleteHandler(_id: string): void {
    messageInput.value.model = "";
    messageInput.value.replying = false;
    deleteMessage(_id);
    readMessages(props.data.chat._id);
    groups.value = loadMessages(props.data.chat._id);
  }
  function editHandler(_id: string): void {
    messageInput.value.model = "";
    messageInput.value.replying = false;
    const messages: ChatMessage[] = groups.value?.map((a) => a.messages).flat();
    const message: ChatMessage = messages?.find((a) => a._id === _id);
    if (message) {
      messageInput.value.model = message.text;
      messageEdit.value = {
        _id,
        text: message.text,
      };
      const rdInput: HTMLInputElement =
        rdChatFooter.value?.querySelector("input");
      if (rdInput) rdInput.focus();
    }
  }
  function replyHandler(_id: string): void {
    const messages: ChatMessage[] = groups.value?.map((a) => a.messages).flat();
    const message: ChatMessage = messages?.find((a) => a._id === _id);
    messageReply.value = {
      _id,
      text: message.text,
      date: message.date,
      from: message.from,
    };
    messageInput.value.replying = true;
    const rdInput: HTMLInputElement =
      rdChatFooter.value?.querySelector("input");
    if (rdInput) rdInput.focus();
  }
  function shareHandler(): void {}
  function deleteReply(): void {
    messageInput.value.replying = false;
    messageReply.value = null;
  }
  function sendHandler(e: Event): void {
    e?.preventDefault();
    if (message.value) {
      if (messageEdit.value) {
        editMessage(messageEdit.value._id, message.value);
        groups.value = loadMessages(props.data.chat._id);
        messageEdit.value = null;
        messageInput.value.model = "";
        messageInput.value.replying = false;
        messageReply.value = null;
      } else {
        const lastDate: number = new Date(groups.value?.[0]?.date).setHours(
          0,
          0,
          0,
          0
        );
        const date: number = new Date().setHours(0, 0, 0, 0);

        const chatMessage: ChatMessageDecoy = {
          _id: generateMessageId(),
          chat_id: props.data.chat._id,
          text: message.value,
          date: new Date(),
          read: true,
          from: {
            _id: "0",
            name: "Claren",
          },
          reply_id: messageReply.value?._id,
          reply: messageReply.value,
          divider: lastDate !== date,
          same:
            groups.value[0]?.messages[0]?.from._id === "0" && lastDate === date,
        };

        messageInput.value.model = "";
        messageInput.value.replying = false;
        messageReply.value = null;
        messageDecoy.value = chatMessage;

        const scroll: boolean =
          rdChatBody.value.getBoundingClientRect().height >=
          rdPanel.value.getBoundingClientRect().height - 147;

        setTimeout(() => {
          const offset: number = !scroll
            ? rdChatBody.value.getBoundingClientRect().height +
              rdMessageDecoy.value.getBoundingClientRect().height +
              (chatMessage.divider ? 27 : 0) -
              (rdPanel.value.getBoundingClientRect().height - 147)
            : 0;

          const anim: GSAPTimeline = animate.sendMessage(
            offset,
            rdMessageDecoy.value,
            rdMessageDividerDecoy.value,
            rdChatBody.value,
            () => {
              messageDecoy.value = null;
              delete chatMessage.divider;
              sendMessage(chatMessage);
              readMessages(props.data.chat._id);
              groups.value = loadMessages(props.data.chat._id);
              clearTimeout(messageTimeout.value);
              messageTimeout.value = setTimeout(sendDecoyMessage, 1000);
            }
          );
          setTimeout(() => {
            anim.play();
          }, 50);
        }, 100);
      }
    }
  }

  function sendDecoyMessage(): void {
    if (props.data.chat.type === "group") {
      const lastDate: number = new Date(groups.value?.[0]?.date).setHours(
        0,
        0,
        0,
        0
      );
      const date: number = new Date().setHours(0, 0, 0, 0);

      const chatMessage: ChatMessageDecoy = {
        _id: generateMessageId(),
        chat_id: props.data.chat._id,
        text: "Hello! I hope you liked my implementation of Quicks, I really hope that I can be part of Simpul <3",
        date: new Date(),
        read: false,
        from: {
          _id: "3",
          name: "Kemal Dwi Heldy Muhammad",
        },
        divider: lastDate !== date,
        same: groups.value[0]?.messages[0]?.from._id === "3",
      };

      messageReply.value = null;
      messageDecoy.value = chatMessage;

      const scroll: boolean =
        rdChatBody.value.getBoundingClientRect().height >=
        rdPanel.value.getBoundingClientRect().height - 147;

      setTimeout(() => {
        const offset: number = !scroll
          ? rdChatBody.value.getBoundingClientRect().height +
            rdMessageDecoy.value.getBoundingClientRect().height +
            (chatMessage.divider ? 27 : 0) -
            (rdPanel.value.getBoundingClientRect().height - 147)
          : 0;
        const anim: GSAPTimeline = animate.sendMessage(
          offset,
          rdMessageDecoy.value,
          rdMessageDividerDecoy.value,
          rdChatBody.value,
          () => {
            messageDecoy.value = null;
            delete chatMessage.divider;
            sendMessage(chatMessage);
            readMessages(props.data.chat._id);
            groups.value = loadMessages(props.data.chat._id);
          }
        );
        setTimeout(() => {
          anim.play();
        }, 50);
      }, 100);
    }
  }

  function scrollToBottom(): void {
    gsap.to(rdChatBody.value, {
      scrollTo: 0,
      duration: 1,
      ease: "power2.out",
    });
  }

  watch(
    () => props.state,
    (val) => {
      if (val === "hide") animate.exit(rdPanel.value);
    }
  );

  onMounted(() => {
    gsap.registerPlugin(ScrollToPlugin);

    animate.init(rdPanel.value);

    groups.value = loadMessages(props.data.chat._id);
    readMessages(props.data.chat._id);

    if (props.data.chat?.type === "individual") {
      rdChatLoading.value.children[1].children[0]?.removeAttribute("style");
      rdChatLoading.value.children[0].children[0]?.removeAttribute("style");
      setTimeout(() => {
        const tl: GSAPTimeline = gsap.timeline({
          onComplete() {
            loading.value = false;
          },
        });
        tl.to(rdChatLoading.value, {
          background: "#d2f2ea",
          duration: 0.25,
        })
          .to(
            rdChatLoading.value.children[0].children,
            {
              y: "-100%",
              opacity: 0,
              duration: 0.25,
              ease: "power2.inOut",
            },
            "<0"
          )
          .to(
            rdChatLoading.value.children[1].children,
            {
              y: 0,
              opacity: 1,
              duration: 0.25,
              ease: "power2.inOut",
            },
            "<0"
          )
          .to(
            rdChatLoading.value,
            {
              opacity: 0,
              duration: 0.25,
            },
            ">1"
          );
      }, 1000);
    } else loading.value = false;

    const rdInput: HTMLInputElement =
      rdChatFooter.value?.querySelector("input");
    if (rdInput) rdInput.focus();

    rdChatBody.value.addEventListener("scroll", scrollHandler);
  });
  onBeforeUnmount(() => {
    rdChatBody.value.removeEventListener("scroll", scrollHandler);
  });
</script>

<style lang="scss" scoped>
  .rd-panel {
    position: fixed;
    width: 610px;
    height: 610px;
    border: var(--border);
    border-radius: 4px;
    background: #fff;
    box-sizing: border-box;
    transform: scale(1.125);
    opacity: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .rd-chat-header {
      z-index: 2;
      position: relative;
      width: 100%;
      height: 75px;
      padding: 0 25px;
      border-bottom: var(--border);
      background: #fff;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      .rd-chat-button {
        cursor: pointer;
        position: relative;
        width: 24px;
        height: 100%;
        padding: 25px 0;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .rd-chat-detail-container {
        position: relative;
        width: calc(100% - 72px);
        height: 100%;
        margin-left: 15px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        span.rd-chat-name {
          position: relative;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--primary-color);
        }
        span.rd-chat-caption {
          position: relative;
          margin-top: 6px;
        }
      }
    }
    .rd-chat-body {
      position: relative;
      width: 100%;
      max-height: calc(100% - 145px);
      padding: 0 29px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column-reverse;
      align-items: center;
      overflow-y: auto;
      .rd-chat-message {
        position: relative;
        width: 100%;
        display: flex;
        &.rd-chat-message-self {
          justify-content: flex-end;
        }
        &.rd-chat-message-decoy {
          position: absolute;
          bottom: 0;
          left: 0;
          padding: 0 29px;
          box-sizing: border-box;
          opacity: 0;
        }
      }
      .rd-chat-divider {
        position: relative;
        width: 100%;
        height: 17px;
        margin-top: 12px;
        display: flex;
        justify-content: center;
        align-items: center;
        &::before {
          content: "";
          position: relative;
          height: 1px;
          width: 100%;
          background: var(--border-color);
        }
        span.rd-chat-information {
          position: absolute;
          height: 100%;
          padding: 0 24px;
          background: #fff;
          justify-content: center;
          align-items: center;
        }
        &.rd-chat-divider-unread {
          &::before {
            background: var(--error-color);
          }
          span.rd-chat-information {
            color: var(--error-color);
          }
        }
        &.rd-chat-divider-decoy {
          position: absolute;
          bottom: 0;
          left: 0;
          opacity: 0;
          padding: 0 29px;
          box-sizing: border-box;
        }
      }
      .rd-chat-group {
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column-reverse;
      }
      .rd-chat-scroll {
        cursor: pointer;
        position: fixed;
        bottom: 70px;
        padding: 9px 12px;
        box-sizing: border-box;
        border-radius: 5px;
        background: #e9f3ff;
        display: flex;
        align-items: center;
        transition: 0.25s transform, 0.25s background-color, 0.25s opacity;
        opacity: 0;
        transform: translateY(100%);
        span.rd-chat-scroll-text {
          position: relative;
          line-height: 1;
          color: var(--primary-color);
        }
        .rd-chat-scroll-icon {
          position: relative;
          width: 16px;
          height: 16px;
          margin-left: 6px;
        }
        &:active {
          transform-origin: center center;
          transform: scale(0.875);
          background: rgb(192, 218, 250);
        }
        &.rd-chat-scroll-visible {
          opacity: 1;
          transform: translateY(0);
        }
      }
    }
    .rd-chat-footer {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 70px;
      padding: 10px 20px 20px 20px;
      background: #fff;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      .rd-chat-reply {
        z-index: 1;
        position: absolute;
        left: 20px;
        bottom: calc(100% - 14px);
        width: calc(100% - 129px);
        padding: 16px;
        border: var(--border);
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        box-sizing: border-box;
        background: var(--tersier-color);
        display: flex;
        flex-direction: column;
        span.rd-chat-reply-message {
          position: relative;
          margin-top: 5px;
        }
        .rd-chat-reply-close {
          cursor: pointer;
          position: absolute;
          top: 12px;
          right: 12px;
          width: 20.571px;
          height: 20.571px;
        }
      }
      .rd-chat-loading {
        position: absolute;
        bottom: 100%;
        left: 20px;
        width: calc(100% - 40px);
        height: 54px;
        border-radius: 5px;
        padding: 0 15px;
        box-sizing: border-box;
        background: #e9f3ff;
        display: flex;
        align-items: center;
        .rd-chat-loading-wrapper {
          position: absolute;
          top: 14px;
          left: 15px;
          width: calc(100% - 30px);
          height: calc(100% - 28px);
          display: flex;
          overflow: hidden;
          .rd-chat-loading-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            span.rd-chat-loading-text {
              position: relative;
              margin-left: 16px;
            }
            .rd-chat-loading-spinner {
              position: relative;
              width: 26px;
              height: 26px;
              border-radius: 13px;
              background: #f8f8f8;
              display: inline-block;
              &::before {
                content: "";
                position: absolute;
                top: 3px;
                left: 3px;
                width: 20px;
                height: 20px;
                border-radius: 10px;
                background: #e9f3ff;
              }
              div {
                box-sizing: border-box;
                display: block;
                position: absolute;
                width: 26px;
                height: 26px;
                border: 3px solid var(--primary-color);
                border-radius: 50%;
                animation: rotate 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                border-color: var(--primary-color) transparent transparent
                  transparent;
                &:nth-child(1) {
                  animation-delay: -0.45s;
                }
                &:nth-child(2) {
                  animation-delay: -0.3s;
                }
                &:nth-child(3) {
                  animation-delay: -0.15s;
                }
              }
            }
          }
          &:last-child {
            .rd-chat-loading-container {
              transform: translateY(100%);
              opacity: 0;
              span.rd-chat-loading-text {
                margin: 0;
              }
            }
          }
        }
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      }
    }
  }
</style>
