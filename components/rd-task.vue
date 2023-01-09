<template>
  <div
    class="rd-task"
    ref="rdTask"
    :class="`${state === 'expanded' ? 'rd-task-expanded' : ''} ${
      tagState === 'show' ? 'rd-task-editing-tags' : ''
    } ${task.completed ? 'rd-task-completed' : ''} ${
      actionState === 'show' ? 'rd-task-action-showed' : ''
    }`"
    :data-offset="offset"
  >
    <div ref="rdTaskHeader" class="rd-task-header">
      <div class="rd-task-checkbox" @click="checkHandler">
        <rd-svg
          v-if="task.completed"
          class="rd-task-check"
          name="check"
        ></rd-svg>
      </div>
      <div class="rd-task-detail-container">
        <span
          v-if="!changing"
          @click="changeHandler"
          class="rd-task-title rd-headline-5"
        >
          {{ task.title || "No Title" }}
        </span>
        <rd-input-text v-else :input="titleInput" class="rd-task-title-input" />
        <div class="rd-task-detail">
          <span
            v-if="task.date && dueHandler(new Date(task.date)) <= 10"
            class="rd-task-due rd-caption-text"
            >{{
              dueHandler(new Date(task.date)) >= 0
                ? `${dueHandler(new Date(task.date))} Days Left`
                : `${dueHandler(new Date(task.date))} Days Late`
            }}</span
          >
          <span v-if="task.date" class="rd-task-due-date rd-caption-text">{{
            dateHandler(new Date(task.date))
          }}</span>
          <div class="rd-task-actions-container">
            <div
              class="rd-task-action"
              @click="stateHandler"
              style="margin: 0 10px 0 10px"
              :style="state === 'expanded' ? 'transform: rotate(180deg)' : ''"
            >
              <rd-svg
                class="rd-task-action-icon"
                style="transform: rotate(180deg)"
                name="chevron-down"
              />
            </div>
            <div class="rd-task-action" @click="actionHandler">
              <rd-svg class="rd-task-action-icon" name="dots" />
            </div>
            <div
              ref="rdAction"
              class="rd-task-action-container"
              :class="actionState === 'show' ? 'rd-task-action-opened' : ''"
            >
              <div
                data-action="delete"
                class="rd-task-action-option rd-task-action-option-delete"
              >
                <span class="rd-task-action-text rd-subtitle-text">Delete</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div ref="rdTaskBody" class="rd-task-body">
      <div class="rd-task-info-wrapper">
        <div class="rd-task-info-icon-container">
          <rd-svg
            class="rd-task-info-icon"
            name="clock"
            :color="task.date ? 'primary' : ''"
          />
        </div>
        <div class="rd-task-info-input-container" style="width: 193px">
          <rd-input-date class="rd-task-info-input" :input="dateInput" />
        </div>
      </div>
      <div class="rd-task-info-wrapper">
        <div class="rd-task-info-icon-container">
          <rd-svg
            class="rd-task-info-icon"
            name="pencil"
            :color="task.description ? 'primary' : ''"
          />
        </div>
        <div class="rd-task-info-input-container" ref="rdTaskDescription">
          <span
            class="rd-task-description rd-body-text"
            @click="editHandler"
            v-if="!editing"
            >{{ task.description || "No Description" }}</span
          >
          <rd-input-textarea
            v-else
            :input="descriptionInput"
            class="rd-task-info-input"
          />
        </div>
      </div>
      <div
        class="rd-task-info-wrapper"
        style="cursor: pointer"
        @click="tagHandler"
      >
        <div class="rd-task-info-icon-container" style="overflow-x: auto">
          <rd-svg
            class="rd-task-info-icon"
            :color="task.tags?.length ? 'primary' : ''"
            name="tag"
          />
        </div>
        <div class="rd-task-info-input-container">
          <span
            v-for="tag in selectedTags"
            :key="tag.name"
            class="rd-task-info-tag rd-headline-6"
            :style="`background: ${tag.color}`"
            data-type="action"
            :data-name="tag.name"
            :data-color="tag.color"
            @click="selectTag"
            >{{ tag.name }}</span
          >
        </div>
        <div class="rd-task-info-tags" data-type="action">
          <span
            v-for="tag in tags"
            :key="tag.name"
            class="rd-task-info-tag rd-headline-6"
            :style="`background: ${tag.color}`"
            data-type="action"
            :data-name="tag.name"
            :data-color="tag.color"
            :class="
              tagClassHandler(tag.name) ? 'rd-task-info-tag-selected' : ''
            "
            @click="selectTag"
            >{{ tag.name }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import gsap from "gsap";
  import { ComputedRef } from "vue";
  import { InputDateOption, InputOption, Task } from "~~/interfaces/general";

  const props = defineProps<{
    task: Task;
  }>();
  const emits = defineEmits([
    "view-changed",
    "state-changed",
    "updated",
    "delete",
  ]);
  const { tags } = useTask();

  const rdTask = ref<HTMLDivElement>(null);
  const rdTaskHeader = ref<HTMLDivElement>(null);
  const rdTaskBody = ref<HTMLDivElement>(null);
  const rdTaskDescription = ref<HTMLDivElement>(null);
  const rdAction = ref<HTMLDivElement>(null);

  const state = ref<"collapsed" | "expanded">("collapsed");
  const editing = ref<boolean>(false);
  const changing = ref<boolean>(false);
  const tagState = ref<"show" | "hide">("hide");
  const actionState = ref<"show" | "hide">("hide");
  const actionAnim = ref<GSAPTimeline>(null);

  const dateInput = ref<InputDateOption>({
    model: "",
    placeholder: "Set Date",
  });
  const descriptionInput = ref<InputOption>({
    name: "description",
    model: "",
    placeholder: "No Description",
  });
  const titleInput = ref<InputOption>({
    name: "title",
    model: "",
    placeholder: "Type Task Title",
  });

  const selectedTags = ref<{ name: string; color: string }[]>([]);

  const offset = ref<number>(0);

  const date: ComputedRef<Date> = computed(
    () => new Date(dateInput.value.value)
  );
  const description: ComputedRef<string> = computed(
    () => descriptionInput.value.model
  );
  const title: ComputedRef<string> = computed(() => titleInput.value.model);

  function dateHandler(x: Date): string {
    const year: number = x.getFullYear();
    const month: number = x.getMonth();
    const date: number = x.getDate();

    return `${date.toString().padStart(2, "0")}/${(month + 1)
      .toString()
      .padStart(2, "0")}/${year}`;
  }
  function dueHandler(x: Date): number {
    const currentDate: Date = new Date();

    return (
      Math.ceil(x.getTime() / 86400000) -
      Math.ceil(currentDate.getTime() / 86400000)
    );
  }
  function stateHandler(e?: MouseEvent): MouseEvent {
    if (state.value === "collapsed") state.value = "expanded";
    else state.value = "collapsed";

    emits("view-changed", {
      state: state.value,
      rdElement: rdTask.value,
    });

    return e;
  }
  function editHandler(e?: Event): Event {
    if (!editing.value) {
      editing.value = !editing.value;

      descriptionInput.value.model = props.task.description || "";

      emits("view-changed", {
        state: "editing",
        rdElement: rdTask.value,
      });
      setTimeout(() => {
        const rdInput: HTMLElement =
          rdTaskDescription.value.querySelector("textarea");
        if (rdInput) rdInput.focus();
        rdInput.addEventListener("blur", editHandler);
      }, 100);
    } else {
      const rdInput: HTMLElement =
        rdTaskDescription.value.querySelector("textarea");
      rdInput.removeEventListener("blur", editHandler);

      editing.value = !editing.value;

      emits("updated", {
        _id: props.task._id,
        description: description.value,
      });

      setTimeout(() => {
        emits("view-changed", {
          state: "edited",
          rdElement: rdTask.value,
        });
      }, 120);
    }

    return e;
  }
  function tagHandler(e?: MouseEvent): MouseEvent {
    if (tagState.value === "hide") {
      tagState.value = "show";
      setTimeout(() => {
        window.addEventListener("click", tagHandler);
      }, 10);
    } else {
      if (e.target instanceof HTMLElement) {
        const type: string = e.target.dataset.type;
        if (type !== "action") {
          window.removeEventListener("click", tagHandler);
          tagState.value = "hide";
        }
      } else {
        window.removeEventListener("click", tagHandler);
        tagState.value = "hide";
      }
    }
    return e;
  }
  function tagClassHandler(name: string): boolean {
    return selectedTags.value?.findIndex((a) => a.name === name) !== -1;
  }
  function changeHandler(e?: MouseEvent): MouseEvent {
    if (!changing.value) {
      changing.value = true;
      titleInput.value.model = props.task.title;
      setTimeout(() => {
        const rdInput: HTMLInputElement =
          rdTaskHeader.value.querySelector("input");
        if (rdInput) rdInput.focus();
        window.addEventListener("click", changeHandler);
      }, 100);
    } else {
      if (e.target instanceof HTMLInputElement) {
      } else {
        emits("updated", {
          _id: props.task._id,
          name: title.value,
        });
        window.removeEventListener("click", changeHandler);
        changing.value = false;
      }
    }

    return e;
  }
  function actionHandler(e: MouseEvent): MouseEvent {
    if (actionState.value === "hide") {
      actionState.value = "show";
      setTimeout(() => {
        window.addEventListener("click", clickHandler);
      }, 10);
    } else actionState.value = "hide";

    return e;
  }
  function clickHandler(e: MouseEvent): MouseEvent {
    window.removeEventListener("click", clickHandler);
    if (e.target instanceof HTMLElement) {
      const action: "delete" = e.target.dataset.action as "delete";
      if (action) emits("delete", props.task._id);
      actionState.value = "hide";
    }

    return e;
  }
  function checkHandler(e?: MouseEvent): MouseEvent {
    emits("state-changed", {
      _id: props.task._id,
      checked: !props.task.completed,
    });

    return e;
  }

  function selectTag(e?: MouseEvent): MouseEvent {
    if (e.target instanceof HTMLElement) {
      const name = e.target.dataset.name;
      const color = e.target.dataset.color;
      if (name && color) {
        const index: number = selectedTags.value.findIndex(
          (a) => a.name === name
        );
        if (index > -1) {
          selectedTags.value.splice(index, 1);
        } else {
          selectedTags.value.push({
            name,
            color,
          });
        }
      }
    }
    return e;
  }

  const animate = {
    openAction(rdAction: HTMLElement): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline();

      tl.to(rdAction, {
        opacity: 1,
        scale: 1,
        ease: "power2.inOut",
        duration: 0.25,
      });

      return tl;
    },
    closeAction(rdAction: HTMLElement): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          gsap.to(rdAction, {
            scale: 1.125,
            duration: 0,
          });
        },
      });

      tl.to(rdAction, {
        opacity: 0,
        scale: 1.125,
        ease: "power2.inOut",
        duration: 0.25,
      });

      return tl;
    },
  };

  watch(
    () => props.task.description,
    (val) => {
      setTimeout(() => {
        offset.value =
          (rdTaskBody.value?.getBoundingClientRect().height || 0) - 185;
      }, 100);
    }
  );

  watch(
    () => tagState.value,
    (val) => {
      if (val === "show") {
        rdTask.value.style.zIndex = "100";
      } else {
        setTimeout(() => {
          rdTask.value.removeAttribute("style");
        }, 250);
      }
    }
  );

  watch(
    () => actionState.value,
    (val) => {
      if (actionAnim.value?.isActive()) actionAnim.value.kill();
      if (val === "show") {
        actionAnim.value = animate.openAction(rdAction.value);
      } else {
        actionAnim.value = animate.closeAction(rdAction.value);
      }
    }
  );

  watch(
    () => selectedTags.value,
    (val) => {
      emits("updated", {
        _id: props.task._id,
        tags: val,
      });
    },
    { deep: true }
  );
  watch(
    () => date.value,
    (val) => {
      emits("updated", {
        _id: props.task._id,
        date: new Date(val),
      });
    },
    { deep: true }
  );

  onMounted(() => {
    if (props.task.date) {
      const date: Date = new Date(props.task.date);
      dateInput.value.model = `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;

      dateInput.value.value = date.toISOString();
    }
    if (props.task.tags?.length) {
      selectedTags.value = props.task.tags;
    }
    setTimeout(() => {
      offset.value =
        (rdTaskBody.value?.getBoundingClientRect().height || 0) - 185;
    }, 1000);
  });
</script>

<style lang="scss" scoped>
  .rd-task {
    z-index: 0;
    position: relative;
    width: 100%;
    background: #fff;
    display: flex;
    flex-direction: column;
    .rd-task-header {
      position: relative;
      width: 100%;
      padding: 22.5px 0;
      display: flex;
      .rd-task-checkbox {
        cursor: pointer;
        position: relative;
        width: 18px;
        height: 18px;
        border: 2px solid var(--background-depth-two-color);
        border-radius: 2px;
        box-sizing: border-box;
      }
      .rd-task-detail-container {
        position: relative;
        width: calc(100% - 41px);
        margin-left: 23px;
        padding-top: 0.5px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        span.rd-task-title {
          position: relative;
          width: calc(100% - 200px);
        }
        .rd-task-title-input {
          position: absolute;
          left: 0;
          top: -11.5px;
          width: calc(100% - 200px);
        }
        .rd-task-detail {
          position: absolute;
          right: 0;
          width: 200px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          span {
            position: relative;
            line-height: 1;
          }
          span.rd-task-due {
            position: relative;
            margin-right: 10px;
            color: var(--error-color);
          }
          .rd-task-actions-container {
            position: relative;
            display: flex;
            .rd-task-action {
              cursor: pointer;
              position: relative;
              width: 18px;
              height: 18px;
              display: flex;
              justify-content: center;
              transition: 0.25s transform;
            }
            .rd-task-action-container {
              pointer-events: none;
              position: absolute;
              top: 16px;
              right: 3px;
              width: 126px;
              height: 43px;
              background: #fff;
              border-radius: 5px;
              box-sizing: border-box;
              border: var(--border);
              border-color: #bdbdbd;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              opacity: 0;
              transform: scale(1.125);
              &.rd-task-action-opened {
                pointer-events: all;
              }
              .rd-task-action-option {
                cursor: pointer;
                position: relative;
                width: 100%;
                height: 100%;
                padding: 0 16px;
                box-sizing: border-box;
                background: rgba(0, 0, 0, 0);
                display: flex;
                align-items: center;
                transition: 0.25s background-color;
                * {
                  pointer-events: none;
                }
                span.rd-task-action-text {
                  color: var(--primary-color);
                }
                &:hover {
                  background: rgba(0, 0, 0, 0.05);
                }
                &:active {
                  background: rgba(0, 0, 0, 0.15);
                }
                &.rd-task-action-option-delete {
                  span.rd-task-action-text {
                    color: var(--error-color);
                  }
                }
              }
            }
          }
        }
      }
    }
    .rd-task-body {
      pointer-events: none;
      position: relative;
      width: 100%;
      padding-left: 41px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      opacity: 0;
      transition: 0.25s opacity;
      .rd-task-info-wrapper {
        position: relative;
        width: 100%;
        margin-bottom: 10px;
        display: flex;
        .rd-task-info-icon-container {
          position: relative;
          width: 20px;
          height: 40px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .rd-task-info-input-container {
          position: relative;
          width: calc(100% - 38px);
          margin-left: 18px;
          display: flex;
          align-items: center;
          span.rd-task-description {
            position: relative;
            padding: 11.25px 0;
            box-sizing: border-box;
            line-height: 1.25;
          }
          span.rd-task-info-tag {
            cursor: pointer;
            position: relative;
            padding: 8px 12px;
            margin-right: 10px;
            box-sizing: border-box;
            border-radius: 5px;
            line-height: 1;
            white-space: nowrap;
            display: flex;
            flex-shrink: 0;
            align-items: center;
            &:last-child {
              margin: 0;
            }
          }
          .rd-task-info-input {
            position: relative;
            width: calc(100% - 2px);
          }
        }
        .rd-task-info-tags {
          pointer-events: none;
          z-index: 2;
          position: absolute;
          top: 100%;
          left: 0;
          width: 277px;
          padding: 15px;
          border: var(--border);
          border-radius: 5px;
          background: #fff;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: scale(1.125);
          transition: 0.25s transform, 0.25s opacity;
          span.rd-task-info-tag {
            cursor: pointer;
            position: relative;
            width: 100%;
            height: 28px;
            padding: 0 14px;
            margin-bottom: 10px;
            box-sizing: border-box;
            border-radius: 5px;
            display: flex;
            align-items: center;
            &:last-child {
              margin: 0;
            }
            &.rd-task-info-tag-selected::before {
              content: "";
              position: absolute;
              top: -1px;
              left: -1px;
              width: calc(100% + 2px);
              height: calc(100% + 2px);
              border-radius: 6px;
              border: 1px solid var(--primary-color);
              box-sizing: border-box;
            }
          }
        }
        &:last-child::before {
          content: "";
          position: absolute;
          left: -12px;
          top: -4.5px;
          width: calc(100%);
          height: 49px;
          background: #f9f9f9;
          border-radius: 5px;
        }
      }
    }
    &.rd-task-completed {
      .rd-task-detail-container {
        span.rd-task-title {
          text-decoration: line-through;
          color: var(--font-secondary-color);
        }
      }
    }
    // &.rd-task-action-showed {
    //   z-index: 2;
    // }
    &.rd-task-expanded {
      z-index: 2;
      .rd-task-body {
        opacity: 1;
        pointer-events: all;
      }
    }
    &.rd-task-editing-tags {
      .rd-task-body {
        .rd-task-info-wrapper {
          .rd-task-info-tags {
            pointer-events: all;
            opacity: 1;
            transform: scale(1);
          }
        }
      }
    }
    // &:not(.rd-task-expanded) {
    //   .rd-task-header {
    //     .rd-task-detail-container {
    //       span.rd-task-title {
    //         text-overflow: ellipsis;
    //         white-space: nowrap;
    //         overflow: hidden;
    //       }
    //     }
    //   }
    // }
  }
</style>
