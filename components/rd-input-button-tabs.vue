<template>
  <div class="rd-component" ref="rdComponent">
    <div
      v-for="(data, i) in option"
      :key="i"
      :data-offset="68 + 26 * (i + 1) + 60 * i"
      :data-index="i"
      :data-color="`var(--${data.color}-color)`"
      :data-action="data.action"
      class="rd-input-tab-container"
    >
      <div
        class="rd-input-label-container"
        :class="
          tabIndex === -1 && tabState === 'show' && !tabAnim
            ? 'rd-input-label-container-active'
            : ''
        "
      >
        <span class="rd-input-label rd-text-wrapper rd-headline-5">
          <span class="rd-text-container rd-text-container-down">
            <span class="rd-text">{{ data.name }}</span>
          </span>
        </span>
      </div>
      <button
        class="rd-input-component rd-input-tab-component"
        :class="`${buttonAnimating ? 'rd-input-component-animating' : ''}`"
        @mousedown="mouseDownHandler"
        @keypress.space="mouseDownHandler"
        data-type="tab"
      >
        <div class="rd-input-icon-container">
          <rd-svg
            :name="data.icon"
            :color="tabIndex === i ? 'secondary' : data.color"
          />
        </div>
        <div class="rd-input-overlay"></div>
      </button>
    </div>
    <div class="rd-input-button-container">
      <button
        class="rd-input-component rd-input-button-component"
        ref="rdInputButton"
        :class="`${buttonAnimating ? 'rd-input-component-animating' : ''}`"
        @mousedown="mouseDownHandler"
        @keypress.space="mouseDownHandler"
        data-type="main"
      >
        <div class="rd-input-icon-container">
          <rd-svg name="stroke" color="secondary" />
        </div>
        <div class="rd-input-overlay"></div>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import gsap from "gsap";

  const props = defineProps<{
    option: {
      icon: string;
      action: string;
      name: string;
      color: string;
    }[];
    state?: string;
  }>();
  const emits = defineEmits(["changed"]);

  const rdComponent = ref<HTMLDivElement>(null);
  const rdClickedButton = ref<HTMLElement>(null);
  const rdInputButton = ref<HTMLButtonElement>(null);
  const rdTabContainer = ref<HTMLDivElement>(null);

  const buttonAnimating = ref<boolean>(false);
  const buttonClicking = ref<boolean>(false);
  const buttonPressed = ref<boolean>(false);

  const tabAnim = ref<GSAPTimeline>(null);
  const tabState = ref<"show" | "hide">("hide");
  const tabIndex = ref<number>(-1);

  const animate = {
    hover(rdInputComponent: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          gsap.to(rdLetter, {
            y: 0,
            opacity: 1,
            duration: 0,
          });
          gsap.to(rdOverlayLetter, {
            y: "100%",
            opacity: 0,
            duration: 0,
          });
          if (cb) cb();
        },
      });

      const rdLetter: HTMLElement[] = gsap.utils.toArray(
        rdInputComponent.querySelectorAll(
          "label.rd-input-label-main .rd-letter"
        )
      );
      const rdOverlayLetter: HTMLElement[] = gsap.utils.toArray(
        rdInputComponent.querySelectorAll(
          "label.rd-input-label-overlay .rd-letter"
        )
      );

      tl.to(rdLetter, {
        y: "-100%",
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        stagger: 0.05,
      }).to(
        rdOverlayLetter,
        {
          y: 0,
          opacity: 1,
          duration: 0.25,
          ease: "powr2.out",
          stagger: 0.05,
        },
        "<0.125"
      );
    },
    click(rdInputComponent: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const rdOverlay: HTMLElement =
        rdInputComponent.querySelector(".rd-input-overlay");

      tl.to(rdInputComponent, {
        scale: 0.95,
        duration: 0.25,
        ease: "power2.out",
      }).to(
        rdOverlay,
        {
          opacity: 1,
          duration: 0.25,
          ease: "power2.inOut",
        },
        "<0"
      );
    },
    release(rdInputComponent: HTMLElement, cb?: () => void): void {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const rdOverlay: HTMLElement =
        rdInputComponent.querySelector(".rd-input-overlay");

      tl.to(rdInputComponent, {
        scale: 1,
        duration: 0.25,
        ease: "back.out(2)",
      }).to(
        rdOverlay,
        {
          opacity: 0,
          duration: 0.25,
          ease: "power2.out",
        },
        "<0"
      );
    },
    loading(rdInputComponent: HTMLElement, cb?: () => void): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline({});

      const rdLetter: HTMLElement[] = gsap.utils.toArray(
        rdInputComponent.querySelectorAll(
          "label.rd-input-label-main .rd-letter"
        )
      );
      const rdProgressBar: HTMLElement = rdInputComponent.querySelector(
        ".rd-input-progress-bar"
      );

      tl.to(rdLetter, {
        y: "-100%",
        opacity: 0,
        duration: 0.25,
        ease: "power2.in",
        stagger: 0.05,
      }).to(rdProgressBar, {
        opacity: 1,
        duration: 0.25,
        ease: "powr2.out",
      });

      return tl;
    },
    openTab(rdTabContainer: HTMLElement, cb?: () => void): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline({
        paused: true,
        onComplete() {
          if (cb) cb();
        },
      });

      const rdTabButtons: HTMLElement[] = gsap.utils.toArray(
        rdTabContainer.querySelectorAll(".rd-input-tab-container")
      );

      for (const rdTabButton of rdTabButtons) {
        const offsetRaw: string = rdTabButton?.dataset.offset;
        if (offsetRaw) {
          tl.to(
            rdTabButton,
            {
              x: -1 * parseInt(offsetRaw),
              duration: 0.5,
              ease: "power4.out",
            },
            "<0"
          );
        }
      }

      return tl;
    },
    closeTab(rdTabContainer: HTMLElement): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline({
        paused: true,
      });

      const rdTabButtons: HTMLElement[] = gsap.utils.toArray(
        rdTabContainer.querySelectorAll(".rd-input-tab-container")
      );

      for (const rdTabButton of rdTabButtons) {
        tl.to(
          rdTabButton,
          {
            zIndex: 0,
            x: 0,
            duration: 0.25,
            ease: "power1.out",
          },
          "<0"
        );
      }

      return tl;
    },
    selectTab(
      rdTabContainer: HTMLElement,
      rdInput: HTMLElement,
      index?: number
    ): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline();

      const rdButton: HTMLButtonElement = rdTabContainer.querySelector(
        "button.rd-input-component"
      );
      const rdTabs: HTMLElement[] = gsap.utils.toArray(
        rdTabContainer.parentElement.querySelectorAll(".rd-input-tab-container")
      );

      if (index === -1) {
        tl.to(rdInput, {
          x: -16,
          background: "var(--background-depth-three-color)",
          duration: 0.25,
          ease: "power1.out",
        });
      }

      tl.to(
        rdTabContainer,
        {
          zIndex: 20,
          x: 4,
          duration: 0.25,
          ease: "power1.out",
        },
        "<0"
      ).to(
        rdButton,
        {
          width: 68,
          height: 68,
          background: rdTabContainer.dataset.color,
          duration: 0.25,
          ease: "power1.out",
        },
        "<0"
      );

      const clickedIndex: number = parseInt(rdTabContainer.dataset.index);

      for (const rdTab of rdTabs) {
        const i: number = parseInt(rdTab.dataset.index);
        if (i > -1 && i === index) {
          if (i <= clickedIndex) {
            tl.to(
              rdTab,
              {
                x: -parseInt(rdTab.dataset.offset),
                duration: 0.25,
                ease: "power1.out",
              },
              "<0"
            );
          } else {
            tl.to(
              rdTab,
              {
                x: 86 - parseInt(rdTab.dataset.offset),
                duration: 0.25,
                ease: "power1.out",
              },
              "<0"
            );
          }

          tl.to(
            rdTab.querySelector("button"),
            {
              width: 60,
              height: 60,
              background: "var(--tersier-color)",
              duration: 0.25,
              ease: "power1.out",
              onComplete() {
                rdTab.style.zIndex = "1";
              },
            },
            "<0"
          );
        } else if (i > -1 && i > clickedIndex) {
          tl.to(
            rdTab,
            {
              x: 86 - parseInt(rdTab.dataset.offset),
              duration: 0.25,
              ease: "power1.out",
            },
            "<0"
          );
        }
      }

      return tl;
    },
    deselectTab(
      rdTabContainer: HTMLElement,
      rdInput: HTMLElement,
      cb?: () => void
    ): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline({
        onComplete() {
          if (cb) cb();
        },
      });

      const rdTabButtons: HTMLElement[] = gsap.utils.toArray(
        rdTabContainer.querySelectorAll(".rd-input-tab-container")
      );

      tl.to(rdInput, {
        x: 0,
        background: "var(--primary-color)",
        duration: 0.25,
        ease: "power1.out",
      });

      for (const rdTabButton of rdTabButtons) {
        const offsetRaw: string = rdTabButton?.dataset.offset;
        if (offsetRaw) {
          tl.to(
            rdTabButton,
            {
              x: -1 * parseInt(offsetRaw),
              duration: 0.5,
              ease: "power4.out",
            },
            "<0"
          ).to(
            rdTabButton.querySelector("button"),
            {
              width: 60,
              height: 60,
              background: "var(--tersier-color)",
              duration: 0.25,
              ease: "power1.out",
              onComplete() {
                rdTabButton.style.zIndex = "1";
              },
            },
            "<0"
          );
        }
      }

      return tl;
    },
  };

  function mouseDownHandler(
    e?: MouseEvent | KeyboardEvent
  ): MouseEvent | KeyboardEvent {
    if (e.target instanceof HTMLElement) {
      rdClickedButton.value = e.target;
      buttonAnimating.value = true;
      buttonClicking.value = true;
      buttonPressed.value = true;
      animate.click(e.target, () => {
        buttonClicking.value = false;
        if (!buttonPressed.value) {
          mouseUpHandler();
        }
      });
      window.addEventListener("mouseup", mouseUpHandler);
      window.addEventListener("keyup", mouseUpHandler);
    }
    return e;
  }
  function mouseUpHandler(): void {
    window.removeEventListener("mouseup", mouseUpHandler);
    window.removeEventListener("keyup", mouseUpHandler);
    buttonPressed.value = false;
    if (!buttonClicking.value) {
      const type: string = rdClickedButton.value?.dataset.type || "";
      if (type === "main") {
        emits("changed", null);
        if (tabIndex.value === -1) {
          if (tabState.value === "hide") tabState.value = "show";
          else if (tabState.value === "show") tabState.value = "hide";
        } else {
          tabIndex.value = -1;
          tabAnim.value = animate.deselectTab(
            rdComponent.value,
            rdInputButton.value,
            () => {
              tabAnim.value = null;
            }
          );
        }
      } else if (type === "tab") {
        const rdParent: HTMLElement = rdClickedButton.value.parentElement;
        const index: number = parseInt(rdParent.dataset.index);
        if (index !== tabIndex.value) {
          emits("changed", rdParent.dataset.action);
          tabAnim.value = animate.selectTab(
            rdParent,
            rdInputButton.value,
            tabIndex.value
          );
          tabIndex.value = index;
        } else {
          emits("changed", null);
          tabIndex.value = -1;
          tabAnim.value = animate.deselectTab(
            rdComponent.value,
            rdInputButton.value,
            () => {
              tabAnim.value = null;
            }
          );
        }
      }
      animate.release(rdClickedButton.value, () => {
        buttonAnimating.value = false;
      });
    }
  }

  watch(
    () => tabState.value,
    (val) => {
      if (tabAnim.value?.isActive()) tabAnim.value.kill();
      if (val === "show") {
        tabAnim.value = animate.openTab(rdComponent.value, () => {
          tabAnim.value = null;
        });
        tabAnim.value.play();
      } else {
        tabAnim.value = animate.closeTab(rdComponent.value);
        tabAnim.value.play();
      }
    }
  );

  watch(
    () => props.state,
    (val) => {
      if (!val && tabIndex.value !== -1) {
        tabIndex.value = -1;
        tabAnim.value = animate.deselectTab(
          rdComponent.value,
          rdInputButton.value,
          () => {
            tabAnim.value = null;
          }
        );
      }
    }
  );

  onBeforeUnmount(() => {
    window.removeEventListener("mouseup", mouseUpHandler);
  });
</script>

<style lang="scss" scoped>
  .rd-component {
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .rd-input-tab-container {
      position: absolute;
      right: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      .rd-input-label-container {
        position: absolute;
        bottom: calc(100% + 10px);
        span.rd-input-label {
          position: relative;
          color: var(--tersier-color);
          * {
            transition: 0.25s transform ease-out;
            color: inherit;
          }
        }
        &.rd-input-label-container-active {
          span.rd-text-container {
            transform: translateY(0);
            span.rd-text {
              transform: translateY(0);
            }
          }
        }
      }
    }
    .rd-input-button-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      button.rd-input-component {
        .rd-input-icon-container {
          padding: 18px 0;
        }
      }
    }
    button.rd-input-component {
      cursor: pointer;
      position: relative;
      width: 68px;
      height: 68px;
      display: flex;
      background: var(--primary-color);
      box-shadow: var(--box-shadow);
      border-radius: 34px;
      border: none;
      padding: 0;
      margin: 0;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: background-color 0.25s ease-out;
      * {
        pointer-events: none;
      }
      .rd-input-icon-container {
        position: relative;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.05);
        padding: 0 22px;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .rd-input-overlay {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 0.5rem;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
        opacity: 0;
      }
      &.rd-input-component-disabled {
        pointer-events: none;
        filter: grayscale(0.75);
        opacity: 0.5;
      }
      &.rd-input-component-animating {
        pointer-events: none !important;
      }
      &.rd-input-component-secondary {
        background: transparent;
        border: 1px solid var(--primary-color);
        box-sizing: border-box;
        .rd-input-label-container {
          label.rd-input-label {
            color: var(--primary-color);
          }
        }
      }
      &.rd-input-component-error {
        background: transparent;
        border: 1px solid var(--error-color);
        box-sizing: border-box;
        .rd-input-label-container {
          label.rd-input-label {
            color: var(--error-color);
          }
        }
      }
      &.rd-input-tab-component {
        width: 60px;
        height: 60px;
        background: var(--tersier-color);
        .rd-input-icon-container {
          padding: 0 18px;
        }
      }
    }
  }
</style>
