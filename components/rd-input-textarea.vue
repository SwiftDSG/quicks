<template>
  <div
    ref="rdInputComponent"
    class="rd-input-component"
    :class="`${props.input.error ? 'rd-input-error-active' : ''} ${
      props.input.disabled ? 'rd-input-disabled' : ''
    }`"
  >
    <div class="rd-input-container">
      <textarea
        class="rd-input rd-body-text"
        :placeholder="props.input.placeholder"
        :name="props.input.name"
        :type="props.input.type === 'number' ? 'text' : props.input.type"
        :disabled="props.input.disabled"
        ref="rdInput"
        @input="updateModel"
      />
      <div class="rd-input-border"></div>
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
  import { InputOption } from "~~/interfaces/general.js";

  const props = defineProps<{
    input: InputOption;
  }>();

  const rdInput = ref<HTMLInputElement>(null);

  const inputError = ref<string>(props.input.error);
  const inputModel = ref<string>("");

  function updateModel({ target, data }: InputEvent): void {
    if (target instanceof HTMLTextAreaElement) {
      if (props.input.type === "number") {
        if ("1234567890".includes(data) || !data) {
          const rawValue: number = parseInt(target.value.split(".").join(""));
          const value: string = rawValue
            ? rawValue.toLocaleString("de-DE")
            : "";
          target.value = value;
          inputModel.value = value;
          props.input.model = value;
        } else {
          target.value = inputModel.value;
        }
      } else {
        inputModel.value = target.value;
        props.input.model = target.value;
      }
    }
  }
  watch(
    () => props.input.model,
    (val) => {
      if (inputModel.value !== val) {
        rdInput.value.value = val;
        inputModel.value = val;
      }
    }
  );
  watch(
    () => props.input.error,
    (val: string) => {
      if (val) inputError.value = val;
    }
  );

  onMounted(() => {
    if (props.input.model) {
      rdInput.value.value = props.input.model;
      inputModel.value = props.input.model;
    }
  });
</script>

<style lang="scss" scoped>
  .rd-input-component {
    position: relative;
    display: flex;
    flex-direction: column;
    .rd-input-container {
      position: relative;
      width: 100%;
      height: 75px;
      border-radius: 5px;
      background: #fff;
      display: flex;
      align-items: center;
      textarea.rd-input {
        resize: none;
        position: relative;
        width: 100%;
        height: 100%;
        padding: 12px 16px;
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
    &.rd-input-disabled {
      pointer-events: none;
      filter: grayscale(0.75);
      opacity: 0.5;
    }
  }
</style>
