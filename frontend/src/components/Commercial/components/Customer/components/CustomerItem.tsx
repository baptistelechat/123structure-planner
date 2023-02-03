import {
  ActionIcon,
  MultiSelect,
  NumberInput,
  Select,
  SelectItem,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import React, { ReactNode } from "react";
import "../../../../../assets/style/CustomerItem.css";
import { IRessource } from "../../../../../data/interfaces/IRessource";
import { TPaymentType } from "../../../../../data/types/TPaymentType";

interface ICustomerItemProps {
  color: string;
  label: (string | number)[];
  updateLabel?: (
    | React.Dispatch<React.SetStateAction<string>>
    | React.Dispatch<React.SetStateAction<number>>
    | React.Dispatch<React.SetStateAction<"30" | "45">>
    | React.Dispatch<React.SetStateAction<TPaymentType>>
    | React.Dispatch<React.SetStateAction<"A" | "B" | "C">>
    | React.Dispatch<React.SetStateAction<string[]>>
  )[];
  icon: React.ReactNode;
  handleClick?: () => void;
  editMode?: boolean;
  inputType?: "text" | "number" | "select" | "multiselect";
  errorMessage?: string[];
}

const CustomerItem = (props: ICustomerItemProps) => {
  const theme = useMantineTheme();
  const smallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`);

  const input = () => {
    if (props.inputType === "text") {
      return props.label.map((label, index) => (
        <TextInput
          key={index}
          className="customerItemInput"
          value={label}
          onChange={(event) => {
            if (props.updateLabel !== undefined) {
              props.updateLabel[index](event.currentTarget.value as any);
            }
          }}
          error={
            props.errorMessage !== undefined
              ? props.errorMessage[index] !== ""
                ? props.errorMessage[index]
                : false
              : false
          }
        />
      ));
    }

    if (props.inputType === "number") {
      return props.label.map((label, index) => (
        <NumberInput
          key={index}
          className="honoraireMontantDevis"
          defaultValue={label as number}
          step={10}
          precision={0}
          min={0}
          value={label as number}
          onChange={(val: number) => {
            if (props.updateLabel !== undefined) {
              props.updateLabel[index](val as any);
            }
          }}
        />
      ));
    }

    if (props.inputType === "select") {
      const getData = () => {
        return props.label.reduce(
          (acc, label: string | number | SelectItem) => {
            const item = {
              value: label,
              label: label.toString().replace("*", ""),
            } as SelectItem;
            acc.push(item);
            return acc;
          },
          [] as (string | SelectItem)[]
        );
      };

      const getValue = () => {
        const labels = props.label as string[];
        return labels.filter((label) => label.includes("*"))[0];
      };

      return (
        <Select
          data={getData()}
          value={getValue()}
          onChange={(val) => {
            if (props.updateLabel !== undefined) {
              props.updateLabel[0](val as any);
            }
          }}
        />
      );
    }

    if (props.inputType === "multiselect") {
      const getData = () => {
        const data = props.label as string[];

        return data.reduce((acc, label: string | SelectItem) => {
          const item = {
            value: label,
            label: label.replace("*", ""),
          } as SelectItem;
          acc.push(item);
          return acc;
        }, [] as (string | SelectItem)[]);
      };

      const getValue = () => {
        const labels = props.label as string[];
        return labels.filter((label) => label.includes("*"));
      };

      return (
        <MultiSelect
          variant="unstyled"
          searchable={!smallScreen}
          nothingFound="Aucun résultat"
          clearable
          data={getData()}
          value={getValue()}
          onChange={(val) => {
            if (props.updateLabel !== undefined) {
              const newValue = val.map((val) => val.replace("*", "")) as any;
              props.updateLabel[0](newValue);
            }
          }}
        />
      );
    }
  };

  return (
    <div
      className={`customerItem ${
        props.handleClick !== undefined && !props.editMode
          ? "customerClickableItem"
          : ""
      }`}
      onClick={
        props.handleClick !== undefined && !props.editMode
          ? props.handleClick
          : () => ""
      }
    >
      <ActionIcon size="xl" variant="filled" color={props.color}>
        {props.icon}
      </ActionIcon>
      {props.editMode ? input() : <p>{props.label.join(" ")}</p>}
    </div>
  );
};

export default CustomerItem;
