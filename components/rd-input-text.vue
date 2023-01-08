<template>
  <div
    ref="rdInputComponent"
    class="rd-input-component"
    :class="`${props.input.error ? 'rd-input-error-active' : ''} ${
      props.input.disabled ? 'rd-input-disabled' : ''
    } ${props.input.replying ? 'rd-input-replying' : ''}`"
  >
    <div class="rd-input-container">
      <input
        class="rd-input rd-body-text"
        :placeholder="props.input.placeholder"
        :name="props.input.name"
        :type="
          props.input.type === 'number' ||
          props.input.type === 'hour' ||
          props.input.type === 'minute'
            ? 'text'
            : props.input.type
        "
        :disabled="props.input.disabled"
        ref="rdInput"
        @input="updateModel"
      />
      <div
        v-if="props.input.icon || props.input.prefix || props.input.color"
        class="rd-input-icon-container"
      >
        <rd-svg v-if="props.input.icon" :name="props.input.icon" />
        <span
          v-else-if="props.input.prefix"
          class="rd-input-icon-prefix rd-headline-5"
          >{{ props.input.prefix }}</span
        >
        <span
          v-else
          class="rd-input-icon-color"
          :style="`background: ${props.input.color}`"
        ></span>
      </div>
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
    if (target instanceof HTMLInputElement) {
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
      } else if (props.input.type === "hour") {
        let num: number = Math.abs(parseInt(target.value));
        if (isNaN(num)) target.value = "00";
        else if (num > 23) {
          target.value = "23";
        } else target.value = num.toString().padStart(2, "0");
        props.input.model = target.value;
      } else if (props.input.type === "minute") {
        let num: number = Math.abs(parseInt(target.value));
        if (isNaN(num)) target.value = "00";
        else if (num > 59) target.value = "59";
        else target.value = num.toString().padStart(2, "0");
        props.input.model = target.value;
      } else {
        inputModel.value = target.value;
        props.input.model = target.value;
        if (props.input.color) {
          if (/^#([0-9A-F]{3}){1,2}$/i.test(target.value)) {
            props.input.color = target.value;
          } else {
            props.input.color = "#000";
          }
        }
      }
    }
  }

  watch(
    () => props.input.model,
    (val) => {
      if (inputModel.value !== val && rdInput.value) {
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
        position: relative;
        width: 40px;
        height: 40px;
        padding: 0 0.5rem;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        box-sizing: border-box;
        background: rgba(0, 0, 0, 0.05);
        display: flex;
        justify-content: center;
        align-items: center;
        .rd-input-icon-prefix {
          position: relative;
          line-height: 1;
        }
        .rd-input-icon-color {
          position: relative;
          width: 100%;
          height: 1rem;
          border-radius: 0.25rem;
        }
        & + input.rd-input {
          width: calc(100% - 2rem);
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
    &.rd-input-replying {
      .rd-input-border {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        &::before {
          border-top-left-radius: 2px;
          border-top-right-radius: 2px;
        }
      }
    }
  }
</style>
