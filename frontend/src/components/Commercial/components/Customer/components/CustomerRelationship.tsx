import { Card, MultiSelect, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import {
  IconCalendar,
  IconCurrencyEuro,
  IconHomeCheck,
  IconTargetArrow,
  IconUser,
  IconUsers,
} from "@tabler/icons";
import React, { useState } from "react";
import {
  useCustomer,
  useUpdateCustomer,
} from "../../../../../context/CustomerContext";
import { useRessources } from "../../../../../context/RessourceContext";
import { ICustomer } from "../../../../../data/interfaces/ICustomer";
import CustomButton from "../../../../utils/CustomButton";
import CustomDivider from "../../../../utils/CustomDivider";
import CustomTitle from "../../../../utils/CustomTitle";
import EditModeToggle from "../../../../utils/EditModeToggle";
import CustomerItem from "./CustomerItem";

interface ICustomerRelationshipProps {
  customer: ICustomer;
}

const CustomerRelationship = (props: ICustomerRelationshipProps) => {
  const getCurrentGoal = () => {
    const currentYear = props.customer.projectGoal.filter(
      (projectGoal) => projectGoal.year === new Date().getFullYear()
    )[0];

    return currentYear !== undefined ? currentYear.goal : 0;
  };

  const getPreviousYearGoal = () => {
    const previousYear = props.customer.projectGoal.filter(
      (projectGoal) => projectGoal.year === new Date().getFullYear() - 1
    )[0];

    return previousYear !== undefined ? previousYear.goal : 0;
  };

  const [editCustomerRelationship, setEditCustomerRelationship] =
    useState(false);
  const [currentProjectGoal, setCurrentProjectGoal] = useState(
    getCurrentGoal()
  );
  const [previousYearGoal, setPreviousYearGoal] = useState(
    getPreviousYearGoal()
  );

  const currentProjectInvoiced = 100;
  const previousYearProjectInvoiced = 100;

  const ressources = useRessources();
  const customers = useCustomer();
  const setCustomers = useUpdateCustomer();

  const theme = useMantineTheme();
  const smallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.xs}px)`);

  const openURL = (url: string) => {
    window.open(url, "_blank");
  };

  const handleCommercialChange = (newCommercial: string[] | null) => {
    const newCustomers = [...customers];

    const changedCustomer = newCustomers.filter(
      (customer) => customer.name === props.customer.name
    );

    const newValue = ressources.filter((ressource) =>
      newCommercial?.includes(`${ressource.firstName} ${ressource.lastName}`)
    );

    changedCustomer[0].commercial = newValue;

    setCustomers(newCustomers);
  };

  const getLastAppointment = () => {
    if (props.customer.appointment.length > 0) {
      const appointment =
        props.customer.appointment[props.customer.appointment.length - 1];

      return `${appointment.title} (${appointment.date.toLocaleDateString(
        "fr"
      )})`;
    } else {
      return "-";
    }
  };

  const handleValideClick = () => {
    const newCustomer = [...customers];
    const changedCustomer = newCustomer.filter(
      (customer) =>
        customer.category === props.customer.category &&
        customer.group === props.customer.group &&
        customer.name === props.customer.name
    );

    changedCustomer[0].projectGoal.filter(
      (projectGoal) => projectGoal.year === new Date().getFullYear()
    )[0].goal = currentProjectGoal;

    changedCustomer[0].projectGoal.filter(
      (projectGoal) => projectGoal.year === new Date().getFullYear() - 1
    )[0].goal = previousYearGoal;

    setCustomers(newCustomer);
    showNotification({
      title: `✅ Fiche client sauvegardé`,
      message: `La fiche client ${props.customer.name} est mise à jour`,
      color: "green",
    });
    setEditCustomerRelationship(false);
  };

  const handleCancelClick = () => {
    setCurrentProjectGoal(
      props.customer.projectGoal.filter(
        (projectGoal) => projectGoal.year === new Date().getFullYear()
      )[0].goal
    );

    setPreviousYearGoal(
      props.customer.projectGoal.filter(
        (projectGoal) => projectGoal.year === new Date().getFullYear() - 1
      )[0].goal
    );

    showNotification({
      title: `⛔ Fiche client non sauvegardé`,
      message: `Les modifications pour ${props.customer.name} sont annulées`,
      color: "red",
    });
    setEditCustomerRelationship(false);
  };

  return (
    <Card
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      className="customerRelationship"
    >
      <div className="customerIdentityTitle">
        <CustomTitle
          flexStart={true}
          icon={<IconUsers size={24} />}
          title="Relation commerciale"
        />
        <EditModeToggle
          disabled={false}
          editMode={editCustomerRelationship}
          editLabel=""
          validateLabel=""
          cancelLabel=""
          handleEditClick={() => setEditCustomerRelationship(true)}
          handleValideClick={handleValideClick}
          handleCancelClick={handleCancelClick}
        />
      </div>
      <div className="customerItemContainer">
        <div className="customerItemTitle">
          <CustomerItem
            label={smallScreen ? [""] : ["Commercial référent :"]}
            icon={<IconUser size={24} color="black" />}
            color="yellow"
          />
          <MultiSelect
            data={ressources
              .filter((ressource) => ressource.role.includes("Commercial"))
              .map(
                (commercial) => `${commercial.firstName} ${commercial.lastName}`
              )}
            value={props.customer.commercial.map(
              (commercial) => `${commercial.firstName} ${commercial.lastName}`
            )}
            variant="unstyled"
            placeholder="Commercial non défini"
            onChange={(newCommercial) => handleCommercialChange(newCommercial)}
            searchable={!smallScreen}
            nothingFound="Aucun résultat"
            clearable
          />
        </div>
        <div className="customerItemTitle">
          <CustomerItem
            label={["Dernière visite :"]}
            icon={<IconCalendar size={24} color="black" />}
            color="yellow"
          />
          <p>{getLastAppointment()}</p>
        </div>
        <div className="customerProjectGoalContainer">
          <div className="customerItemTitle">
            <CustomerItem
              editMode={editCustomerRelationship}
              inputType={"number"}
              label={[
                editCustomerRelationship
                  ? previousYearGoal
                  : `Objectif ${new Date().getFullYear() - 1} :`,
              ]}
              updateLabel={[setPreviousYearGoal]}
              icon={<IconTargetArrow size={24} color="black" />}
              color="yellow"
            />
            {editCustomerRelationship ? (
              <p>Dossier(s)</p>
            ) : (
              <p>{previousYearGoal}</p>
            )}
          </div>
          <div className="customerItemTitle">
            <CustomerItem
              editMode={editCustomerRelationship}
              inputType={"number"}
              label={[
                editCustomerRelationship
                  ? currentProjectGoal
                  : `Objectif ${new Date().getFullYear()} :`,
              ]}
              updateLabel={[setCurrentProjectGoal]}
              icon={<IconTargetArrow size={24} color="black" />}
              color="yellow"
            />
            {editCustomerRelationship ? (
              <p>Dossier(s)</p>
            ) : (
              <p>{currentProjectGoal}</p>
            )}
          </div>
          <div className="customerItemTitle">
            <CustomerItem
              inputType={"number"}
              label={[`Production ${new Date().getFullYear() - 1} :`]}
              icon={<IconHomeCheck size={24} color="black" />}
              color={
                (previousYearProjectInvoiced / previousYearGoal) * 100 < 80
                  ? "red"
                  : (previousYearProjectInvoiced / previousYearGoal) * 100 >=
                      80 &&
                    (previousYearProjectInvoiced / previousYearGoal) * 100 < 100
                  ? "orange"
                  : "green"
              }
            />
            <p className="customerProductionContainer">
              <span
                style={{
                  color:
                    (previousYearProjectInvoiced / previousYearGoal) * 100 < 80
                      ? theme.colors.red[6]
                      : (previousYearProjectInvoiced / previousYearGoal) *
                          100 >=
                          80 &&
                        (previousYearProjectInvoiced / previousYearGoal) * 100 <
                          100
                      ? theme.colors.orange[6]
                      : theme.colors.green[6],
                }}
              >
                {previousYearProjectInvoiced}
              </span>
              {`/${previousYearGoal}`}
            </p>
          </div>
          <div className="customerItemTitle">
            <CustomerItem
              inputType={"number"}
              label={[`Production ${new Date().getFullYear()} :`]}
              icon={<IconHomeCheck size={24} color="black" />}
              color={
                (currentProjectInvoiced / currentProjectGoal) * 100 < 80
                  ? "red"
                  : (currentProjectInvoiced / currentProjectGoal) * 100 >= 80 &&
                    (currentProjectInvoiced / currentProjectGoal) * 100 < 100
                  ? "orange"
                  : "green"
              }
            />
            <p className="customerProductionContainer">
              <span
                style={{
                  color:
                    (currentProjectInvoiced / currentProjectGoal) * 100 < 80
                      ? theme.colors.red[6]
                      : (currentProjectInvoiced / currentProjectGoal) * 100 >=
                          80 &&
                        (currentProjectInvoiced / currentProjectGoal) * 100 <
                          100
                      ? theme.colors.orange[6]
                      : theme.colors.green[6],
                }}
              >
                {currentProjectInvoiced}
              </span>
              {`/${currentProjectGoal}`}
            </p>
          </div>
        </div>
      </div>
      <CustomDivider />
      <CustomButton
        handleClick={() => openURL(props.customer.priceList)}
        icon={<IconCurrencyEuro />}
        label={"Grille tarifaire"}
        extraStyle={{
          width: "fit-content",
        }}
      />
    </Card>
  );
};

export default CustomerRelationship;
