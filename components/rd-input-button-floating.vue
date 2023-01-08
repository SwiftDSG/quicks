<template>
  <button
    class="rd-input-component"
    ref="rdInputComponent"
    :class="`${props.icon ? 'rd-input-component-icon' : ''} ${
      props.disabled ? 'rd-input-component-disabled' : ''
    } ${
      buttonAnimating ? 'rd-input-component-animating' : ''
    } rd-input-component-${props.type ? props.type : 'primary'}`"
    :disabled="props.disabled"
    @mousedown="mouseDownHandler"
  >
    <div v-if="props.icon" class="rd-input-icon-container">
      <rd-svg :name="props.icon" color="secondary" />
    </div>
    <div class="rd-input-overlay"></div>
  </button>
</template>

<script lang="ts" setup>
  import gsap from "gsap";

  const props = defineProps<{
    type?: "primary" | "secondary" | "error";
    icon?: string;
    disabled?: boolean;
  }>();
  const emits = defineEmits(["clicked"]);

  const rdInputComponent = ref<HTMLButtonElement>(null);

  const buttonAnimating = ref<boolean>(false);
  const buttonClicking = ref<boolean>(false);
  const buttonPressed = ref<boolean>(false);
  const buttonHovered = ref<boolean>(false);
  const buttonLoadingAnim = ref<GSAPTimeline>(null);

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
  };

  function mouseDownHandler(e?: MouseEvent): MouseEvent {
    buttonAnimating.value = true;
    buttonClicking.value = true;
    buttonPressed.value = true;
    animate.click(rdInputComponent.value, () => {
      buttonClicking.value = false;
      if (!buttonPressed.value) {
        mouseUpHandler();
      }
    });
    window.addEventListener("mouseup", mouseUpHandler);
    return e;
  }
  function mouseUpHandler(): void {
    window.removeEventListener("mouseup", mouseUpHandler);
    buttonPressed.value = false;
    if (!buttonClicking.value) {
      emits("clicked");
      animate.release(rdInputComponent.value, () => {
        buttonAnimating.value = false;
      });
    }
  }

  onBeforeUnmount(() => {
    window.removeEventListener("mouseup", mouseUpHandler);
  });
</script>

<style lang="scss" scoped>
  button.rd-input-component {
    cursor: pointer;
    position: fixed;
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
    * {
      pointer-events: none;
    }
    .rd-input-label-container {
      position: relative;
      width: 100%;
      height: 100%;
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
    &.rd-input-component-icon {
      .rd-input-label-container {
        width: calc(100% - 2rem);
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
  }
</style>
