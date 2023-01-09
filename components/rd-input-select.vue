<template>
  <div
    ref="rdInputComponent"
    class="rd-input-component"
    :class="props.input.error ? 'rd-input-error-active' : ''"
  >
    <label v-if="props.input.label" class="rd-input-label rd-headline-6">{{
      props.input.label
    }}</label>
    <div class="rd-input-container">
      <div class="rd-input-icon-container">
        <rd-svg name="chevron-down" />
      </div>
      <input
        class="rd-input rd-body-text"
        :placeholder="props.input.placeholder"
        ref="rdInput"
        readonly
        :name="props.input.name"
        :type="props.input.type"
        @focus="dropDownHandler('open')"
        @blur="dropDownHandler('close')"
        @keydown.up.prevent="
          selectIndex(
            dropDownIndex <= 0
              ? props.input.options.length - 1
              : dropDownIndex - 1
          )
        "
        @keydown.down.prevent="
          selectIndex(
            dropDownIndex >= props.input.options.length - 1
              ? 0
              : dropDownIndex + 1
          )
        "
        @keypress.enter="selectOption"
        @input="updateModel"
      />
      <div class="rd-input-border"></div>
      <div
        ref="rdInputOptions"
        class="rd-input-options"
        :class="dropDownOpened ? 'rd-input-options-opened' : ''"
      >
        <div
          class="rd-input-option rd-body-text"
          v-for="(option, i) in inputOptions"
          :key="i"
          @mouseover="selectIndex(i)"
          @mousedown="selectOption"
          :class="dropDownIndex === i ? 'rd-input-option-selected' : ''"
        >
          {{ typeof option === "string" ? option : option.name }}
        </div>
      </div>
    </div>
    <span
      v-if="typeof props.input.error === 'string'"
      class="rd-input-error rd-headline-6"
    >
      <span class="rd-text-wrapper">
        <span class="rd-text-container rd-text-container-up">
          <span class="rd-text">{{ inputError }}</span>
        </span>
      </span>
    </span>
  </div>
</template>

<script lang="ts" setup>
  import gsap from "gsap";
  import { InputOption } from "~~/interfaces/general.js";

  const props = defineProps<{
    input: InputOption;
  }>();

  const rdInputOptions = ref<HTMLDivElement>(null);
  const rdInput = ref<HTMLInputElement>(null);

  const inputError = ref<string>(props.input.error);
  const inputModel = ref<string>("");
  const inputValue = ref<string>("");
  const inputOptions = ref<InputOption["options"]>(props.input.options);

  const dropDownAnim = ref<GSAPAnimation>(null);
  const dropDownOpened = ref<boolean>(false);
  const dropDownIndex = ref<number>(-1);

  const animate = {
    dropDownHandler(
      rdInputOptions: HTMLElement,
      cb?: () => void
    ): GSAPTimeline {
      const tl: GSAPTimeline = gsap.timeline({
        paused: true,
        onComplete() {
          if (cb) cb();
        },
      });

      tl.to(rdInputOptions, {
        scale: 1,
        opacity: 1,
        duration: 0.25,
        ease: "power2.inOut",
      });

      return tl;
    },
  };

  function dropDownHandler(state: "open" | "close"): void {
    if (!dropDownAnim.value)
      dropDownAnim.value = animate.dropDownHandler(rdInputOptions.value, () => {
        dropDownOpened.value = true;
      });
    if (state === "open") {
      dropDownIndex.value = -1;
      dropDownAnim.value.play();
    } else {
      setTimeout(() => {
        if (dropDownOpened.value) {
          dropDownOpened.value = false;
          dropDownIndex.value = -1;
          dropDownAnim.value.reverse();
        }
      }, 50);
    }
  }

  function updateModel({ target }: InputEvent): void {
    if (target instanceof HTMLInputElement) {
      inputModel.value = target.value;
      dropDownHandler("open");
    }
  }

  function selectIndex(index: number): void {
    dropDownIndex.value = index;
  }

  function selectOption(): void {
    const selection: string | { name: string; value: string } =
      inputOptions.value[dropDownIndex.value];
    if (selection) {
      inputModel.value =
        typeof selection === "string" ? selection : selection.name;
      inputValue.value =
        typeof selection === "string" ? selection : selection.value;
      props.input.model = inputModel.value;
      props.input.value = inputValue.value;
      rdInput.value.value = inputModel.value;
    }
    dropDownHandler("close");
  }

  watch(
    () => props.input.error,
    (val: string) => {
      if (val) inputError.value = val;
    }
  );
  watch(
    () => props.input.options,
    (val) => {
      inputOptions.value = val;
    },
    {
      deep: true,
    }
  );
  watch(
    () => props.input.model,
    (val) => {
      if (val) {
        setTimeout(() => {
          const index: number = inputOptions.value?.findIndex(
            (a) => (typeof a === "string" ? a : a.name) === val
          );
          if (index > -1 && index !== dropDownIndex.value) {
            dropDownIndex.value = index;
            selectOption();
          }
        }, 100);
      }
    }
  );

  onMounted(() => {
    if (props.input.model) {
      inputModel.value = props.input.model;
      rdInput.value.value = inputModel.value;
    }
    if (props.input.value) {
      inputValue.value = props.input.value;
    }
  });
</script>

<style lang="scss" scoped>
  .rd-input-component {
    position: relative;
    display: flex;
    flex-direction: column;
    label.rd-input-label {
      position: relative;
      width: 100%;
      height: 1rem;
      display: flex;
      color: var(--font-color);
      opacity: 0.5;
      align-items: center;
    }
    .rd-input-container {
      position: relative;
      width: 100%;
      height: 40px;
      border-radius: 5px;
      background: #fff;
      display: flex;
      align-items: center;
      input.rd-input {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 0 16px;
        border: none;
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
        box-sizing: border-box;
        color: var(--font-color);
        background: rgba(0, 0, 0, 0);
        display: flex;
        transition: background-color 0.25s;
        &::placeholder {
          color: var(--font-color);
          opacity: 0.5;
          transition: opacity 0.25s;
        }
        &:hover {
          outline: none;
          background: rgba(0, 0, 0, 0);
          &::placeholder {
            opacity: 1;
          }
        }
        &:focus {
          outline: none;
        }
        &:focus + .rd-input-border {
          border-color: var(--primary-color);
          &::before {
            opacity: 0.25;
          }
        }
      }
      .rd-input-icon-container {
        cursor: pointer;
        position: absolute;
        right: 0;
        width: 40px;
        height: 40px;
        padding: 0 11px;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .rd-input-border {
        pointer-events: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        border: var(--border);
        box-sizing: border-box;
        transition: 0.25s border-color, 0.25s border-width;
        &::before {
          content: "";
          position: absolute;
          top: -3px;
          left: -3px;
          width: calc(100% + 6px);
          height: calc(100% + 6px);
          border-radius: 6px;
          border: 3px solid var(--primary-color);
          box-sizing: border-box;
          opacity: 0;
          transition: 0.25s opacity;
        }
      }
      .rd-input-options {
        z-index: 20000;
        pointer-events: none;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        max-height: 9rem;
        background: #fff;
        border-radius: 5px;
        border: var(--border);
        opacity: 0;
        box-sizing: border-box;
        overflow-x: hidden;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        transform: scale(1.125);
        .rd-input-option {
          cursor: pointer;
          position: relative;
          width: 100%;
          height: 2rem;
          background: rgba(0, 0, 0, 0);
          padding: 0 14px;
          border-radius: 5px;
          box-sizing: border-box;
          display: flex;
          flex-shrink: 0;
          align-items: center;
          transition: background-color 0.25s;
          &.rd-input-option-selected {
            background: rgba(0, 0, 0, 0.05);
          }
          &:not(:last-child)::before {
            content: "";
            position: absolute;
            top: calc(100% - 0.5px);
            left: 0;
            width: 100%;
            height: 1px;
            background: var(--border-color);
          }
        }
        &.rd-input-options-opened {
          pointer-events: all;
        }
      }
    }
    span.rd-input-error {
      position: relative;
      width: 100%;
      height: 1rem;
      display: flex;
      color: var(--error-color);
      align-items: center;
      span.rd-text-wrapper {
        span.rd-text-container {
          transition: 0.25s transform;
          span.rd-text {
            transition: 0.25s transform;
          }
        }
      }
    }
    &.rd-input-error-active {
      span.rd-input-error {
        span.rd-text-wrapper {
          span.rd-text-container {
            transform: translateY(0);
            span.rd-text {
              transform: translateY(0);
            }
          }
        }
      }
    }
  }
</style>
