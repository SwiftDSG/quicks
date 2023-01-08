<template>
  <button
    ref="rdInputComponent"
    class="rd-component"
    :class="`${
      buttonAnimating ? 'rd-input-component-animating' : ''
    } rd-input-component-${type || 'idle'}`"
    @mousedown="mouseDownHandler"
  >
    <div class="rd-input-button-icon-container">
      <rd-svg class="rd-input-button-icon" :name="icon" color="primary" />
    </div>
    <span class="rd-input-button-name rd-headline-6">{{ label }}</span>
    <div class="rd-input-overlay"></div>
  </button>
</template>

<script lang="ts" setup>
  import gsap from "gsap";

  const props = defineProps<{
    label: string;
    icon: string;
    type?: "idle" | "active";
  }>();
  const emits = defineEmits(["clicked"]);

  const rdInputComponent = ref<HTMLButtonElement>(null);

  const buttonAnimating = ref<boolean>(false);
  const buttonClicking = ref<boolean>(false);
  const buttonPressed = ref<boolean>(false);

  const animate = {
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
  };

  function mouseDownHandler(e: MouseEvent): MouseEvent {
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
  button.rd-component {
    cursor: pointer;
    position: relative;
    width: 100%;
    padding: 0.5rem;
    border-radius: 0.75rem;
    border: var(--border);
    box-sizing: border-box;
    margin: 0;
    display: flex;
    align-items: center;
    overflow: hidden;
    transition: 0.2s background-color, 0.2s border-color, 0.2s color;
    .rd-input-button-icon-container {
      position: relative;
      width: 2rem;
      height: 2rem;
      padding: 0 0.5rem;
      border-radius: 0.5rem;
      border: var(--border);
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.2s background-color, 0.2s border-color;
    }
    span.rd-input-button-name {
      position: relative;
      margin-left: 0.5rem;
      color: inherit;
    }
    .rd-input-overlay {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.1);
      opacity: 0;
    }
    &.rd-input-component-idle {
      background: var(--background-depth-one-color);
      border-color: var(--border-color);
      color: var(--font-primary-color);
    }
    &.rd-input-component-active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: #fff;
      .rd-input-button-icon-container {
        background: #fff;
        border-color: #fff;
      }
    }
  }
</style>
