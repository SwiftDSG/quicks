<template>
  <div class="rd-panel" ref="rdPanel">
    <div class="rd-panel-header"></div>
    <div class="rd-task-container">
      <div
        ref="rdTaskWrapper"
        v-for="(task, i) in tasks"
        :key="task._id"
        class="rd-task-wrapper"
        :style="`top: ${positionHandler(i, true)}px`"
        :data-index="i"
      >
        <rd-task
          :task="task"
          @view-changed="shiftHandler"
          @state-changed="stateHandler"
          @updated="updateHandler"
        />
        <div
          class="rd-task-divider"
          :style="`top: ${positionHandler(i, false)}px`"
        ></div>
      </div>
    </div>
    <div
      v-if="loading"
      :class="!init ? 'rd-task-overlay-hidden' : ''"
      class="rd-task-overlay"
      ref="rdTaskOverlay"
    >
      <rd-loading class="rd-task-loading" />
      <span class="rd-task-message rd-subtitle-text">Loading Tasks</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import gsap from "gsap";
  import { title } from "process";
  import { Task } from "~~/interfaces/general";

  const props = defineProps<{
    state: "show" | "hide";
  }>();
  const { loadTasks, addTask, editTask, deleteTask, changeTasks } = useTask();

  const loading = ref<boolean>(true);
  const init = ref<boolean>(true);

  const rdPanel = ref<HTMLDivElement>(null);
  const rdTaskWrapper = ref<HTMLDivElement[]>(null);
  const rdTaskOverlay = ref<HTMLDivElement>(null);

  const tasks = ref<Task[]>(null);

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
    show(rdTaskOverlay: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      tl.to(rdTaskOverlay, {
        scale: 1.125,
        opacity: 0,
        ease: "power2.inOut",
        duration: 0.25,
      });
    },
    hide(rdTaskOverlay: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      tl.to(rdTaskOverlay, {
        scale: 1,
        opacity: 1,
        ease: "power2.inOut",
        duration: 0.25,
      });
    },
    shift(
      rdTaskWrapper: HTMLElement[],
      index: number,
      dir: "up" | "down",
      offset: number
    ): void {
      const tl: GSAPTimeline = gsap.timeline();

      for (const rdTask of rdTaskWrapper) {
        const i: number = parseInt(rdTask.dataset.index);
        if (i === index) {
          tl.to(
            rdTask,
            {
              zIndex: dir === "up" ? 0 : 10,
              duration: 0,
            },
            "<0"
          );
          tl.to(
            rdTask.querySelector(".rd-task-divider"),
            {
              y: `${dir === "up" ? "-" : "+"}=${offset}`,
              duration: 0.25,
              ease: "power2.inOut",
            },
            "<0"
          );
        } else if (i > index) {
          tl.to(
            rdTask,
            {
              z: 0,
              y: `${dir === "up" ? "-" : "+"}=${offset}`,
              duration: 0.25,
              ease: "power2.inOut",
            },
            "<0"
          );
        }
      }
    },
  };

  function positionHandler(index: number, inc: boolean): number {
    let pos: number = 0;

    if (inc) {
      for (var i: number = 0; i < index; i++) {
        const rdElement: HTMLElement = rdTaskWrapper.value?.[i];
        if (rdElement)
          pos +=
            rdElement.querySelector(".rd-task-header").getBoundingClientRect()
              .height + 1;
      }
    } else {
      pos =
        rdTaskWrapper.value?.[index]
          ?.querySelector(".rd-task-header")
          .getBoundingClientRect().height || 0;
    }

    if (init.value || loading.value) pos *= 0.8875;

    return pos;
  }
  function shiftHandler({
    rdElement,
    state,
  }: {
    rdElement: HTMLElement;
    state: "collapsed" | "expanded" | "editing" | "edited";
  }): void {
    const rdParent: HTMLElement = rdElement?.parentElement;
    if (rdParent) {
      const index: number = parseInt(rdParent.dataset.index);
      let offset: number =
        rdElement.querySelector(".rd-task-body")?.getBoundingClientRect()
          .height + 22.5;
      if (state === "edited" || state === "editing") {
        offset = parseInt(rdElement.dataset.offset);
      }

      animate.shift(
        rdTaskWrapper.value,
        index,
        state === "collapsed" ||
          (state === "edited" && offset < 0) ||
          (state === "editing" && offset > 0)
          ? "up"
          : "down",
        Math.abs(offset)
      );
    }
  }
  function updateHandler({
    _id,
    description,
    name,
    date,
    tags,
  }: {
    _id: string;
    description?: string;
    name?: string;
    date?: Date;
    tags?: { name: string; color: string }[];
  }): void {
    const index: number = tasks.value?.findIndex((a) => a._id === _id);
    if (index > -1) {
      if (typeof description === "string")
        tasks.value[index].description = description;
      if (date) tasks.value[index].date = date;
      if (tags) tasks.value[index].tags = tags;
      if (typeof name === "string") {
        tasks.value[index].title = name;
        setTimeout(() => {
          recalculate(index);
        }, 100);
      }
      editTask(tasks.value[index]);
    }
  }
  function stateHandler(checked: boolean) {
    console.log(checked);
  }

  function recalculate(index: number): void {
    const tl: GSAPTimeline = gsap.timeline();

    let pos: number = 0;

    for (var i: number = 0; i < rdTaskWrapper.value?.length || 0; i++) {
      const rdElement: HTMLElement = rdTaskWrapper.value[i];

      tl.to(
        rdElement,
        {
          top: pos,
          ease: "power2.inOut",
          duration: 0.25,
        },
        "<0"
      );

      pos +=
        rdElement.querySelector(".rd-task-header").getBoundingClientRect()
          .height + 1;

      if (index === i) {
        tl.to(
          rdElement.querySelector(".rd-task-divider"),
          {
            top: pos - 1,
            ease: "power2.inOut",
            duration: 0.25,
          },
          "<0"
        );
      }
    }
  }

  watch(
    () => props.state,
    (val) => {
      if (val === "hide") animate.exit(rdPanel.value);
    }
  );

  onMounted(async () => {
    animate.init(rdPanel.value);

    tasks.value = await loadTasks();

    setTimeout(() => {
      animate.show(rdTaskOverlay.value, () => {
        init.value = false;
        loading.value = false;
      });
    }, 1000);
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
    padding: 20px 34px 0 34px;
    box-sizing: border-box;
    transform: scale(1.125);
    opacity: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .rd-panel-header {
      z-index: 2;
      position: relative;
      width: 100%;
      height: 34px;
      background: #fff;
    }
    .rd-task-container {
      position: relative;
      width: 100%;
      height: calc(100% - 34px);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      .rd-task-wrapper {
        position: absolute;
        top: 0;
        width: 100%;
        display: flex;
        .rd-task-divider {
          position: absolute;
          width: 100%;
          height: 1px;
          background: var(--border-color);
        }
      }
    }
    .rd-task-overlay {
      pointer-events: none;
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: calc(100% - 54px);
      background: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      span.rd-task-message {
        position: relative;
        margin-top: 24px;
        line-height: 1;
        &::after {
          content: "...";
          position: absolute;
          left: calc(100% + 4px);
        }
      }
      &.rd-task-overlay-hidden {
        opacity: 0;
      }
    }
  }
</style>
