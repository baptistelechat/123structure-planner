import { Card, useMantineTheme } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconCalendarTime,
  IconCash,
  IconCashOff,
  IconCreditCard,
  IconBusinessplan,
  IconCalculator,
} from "@tabler/icons";
import React, { useState } from "react";
import { useCustomers } from "../../../../../context/CustomerContext";
import { ICustomer } from "../../../../../data/interfaces/ICustomer";
import { TPaymentType } from "../../../../../data/types/TPaymentType";
import CustomTitle from "../../../../utils/CustomTitle";
import EditModeToggle from "../../../../utils/EditModeToggle";
import CustomerItem from "../../utils/CustomerItem";

interface ICustomerPaymentProps {
  customer: ICustomer;
}

const CustomerPayment = (props: ICustomerPaymentProps) => {
  const [editCustomerPayment, setEditCustomerPayment] = useState(false);
  const [paymentDeadline, setPaymentDeadline] = useState(
    props.customer.paymentDeadline
  );
  const [paymentType, setPaymentType] = useState<TPaymentType>(
    props.customer.paymentType
  );
  const [paymentStatus, setPaymentStatus] = useState(
    props.customer.paymentStatus
  );

  const currentProjectInvoiced: number = 0;
  const currentInvoiceAmount: number = 0;

  const previousYearProjectInvoiced: number = 0;
  const previousYearInvoiceAmount: number = 0;

  const { customers, updateCustomers } = useCustomers();

  const theme = useMantineTheme();

  const localeCurrencyString = (number: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const selectValue = (
    editMode: boolean,
    currentValue: string | undefined,
    label: string[],
    defaultValue: string[]
  ) => {
    if (editMode) {
      return label.reduce((acc, l) => {
        l === currentValue ? acc.push(l + "*") : acc.push(l);
        return acc;
      }, [] as string[]);
    } else {
      return defaultValue;
    }
  };

  const handleValideClick = async () => {
    const changedCustomer = customers.customersList.filter(
      (customer) =>
        customer.category === props.customer.category &&
        customer.group === props.customer.group &&
        customer.name === props.customer.name
    )[0];

    changedCustomer.paymentDeadline = paymentDeadline;
    changedCustomer.paymentType = paymentType;
    changedCustomer.paymentStatus = paymentStatus;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/customers/${
        changedCustomer._id as string
      }`,
      {
        method: "PATCH",
        body: JSON.stringify({
          paymentDeadline: paymentDeadline,
          paymentType: paymentType,
          paymentStatus: paymentStatus,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();

    if (!response.ok) {
      showNotification({
        title: `⛔ Erreur serveur`,
        message: data.error,
        color: "red",
      });
    }

    updateCustomers({
      type: "UPDATE_CUSTOMER",
      payload: {
        id: changedCustomer._id as string,
        customer: changedCustomer,
      },
    });

    showNotification({
      title: `✅ Fiche client sauvegardée`,
      message: `La fiche client ${props.customer.name} est mise à jour`,
      color: "green",
    });
    setEditCustomerPayment(false);
  };

  const handleCancelClick = () => {
    setPaymentDeadline(props.customer.paymentDeadline);
    setPaymentType(props.customer.paymentType);
    setPaymentStatus(props.customer.paymentStatus);

    showNotification({
      title: `⛔ Fiche client non sauvegardée`,
      message: `Les modifications pour ${props.customer.name} sont annulées`,
      color: "red",
    });
    setEditCustomerPayment(false);
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder className="customerPayment">
      <div className="customerTitle">
        <CustomTitle
          flexStart={true}
          icon={<IconCalendarTime size={24} />}
          title="Comptabilité"
        />
        <EditModeToggle
          editMode={editCustomerPayment}
          editLabel=""
          validateLabel=""
          cancelLabel=""
          handleEditClick={() => setEditCustomerPayment(true)}
          handleValideClick={handleValideClick}
          handleCancelClick={handleCancelClick}
        />
      </div>
      <div className="customerItemContainer">
        <div className="customerItemTitle">
          <CustomerItem
            editMode={editCustomerPayment}
            inputType="select"
            value={selectValue(
              editCustomerPayment,
              paymentDeadline,
              ["30 (Fin de mois)", "30 (Net)", "45"],
              ["Délai de paiement :"]
            )}
            updateValue={[setPaymentDeadline]}
            icon={<IconCalendarTime size={24} color="black" />}
            color="yellow"
          />
          <p>{editCustomerPayment ? "jour(s)" : paymentDeadline}</p>
        </div>
        <div className="customerItemTitle">
          <CustomerItem
            editMode={editCustomerPayment}
            inputType={"select"}
            value={selectValue(
              editCustomerPayment,
              paymentType,
              [
                "Chèque",
                "Virement",
                "Lettre de change relevé (LCR)",
                "Contrat cadre",
              ],
              ["Mode de paiement :"]
            )}
            updateValue={[setPaymentType]}
            icon={<IconCreditCard size={24} color="black" />}
            color="yellow"
          />
          <p>{editCustomerPayment ? "" : paymentType}</p>
        </div>
        <div className="customerItemTitle">
          <CustomerItem
            editMode={editCustomerPayment}
            inputType={"select"}
            value={selectValue(
              editCustomerPayment,
              paymentStatus,
              ["A", "B", "C"],
              ["Statut de paiement :"]
            )}
            updateValue={[setPaymentStatus]}
            icon={
              paymentStatus === "C" ? (
                <IconCashOff size={24} color="black" />
              ) : (
                <IconCash size={24} color="black" />
              )
            }
            color={
              paymentStatus === "A"
                ? "green"
                : paymentStatus === "B"
                ? "orange"
                : "red"
            }
          />
          <p
            style={{
              fontWeight: "bold",
              color:
                paymentStatus === "A"
                  ? theme.colors.green[6]
                  : paymentStatus === "B"
                  ? theme.colors.orange[6]
                  : theme.colors.red[6],
            }}
          >
            {editCustomerPayment ? "" : paymentStatus}
          </p>
        </div>
        <div className="customerProjectGoalContainer">
          <div className="customerItemTitle">
            <CustomerItem
              value={[`Facturation ${new Date().getFullYear() - 1} :`]}
              icon={
                <IconBusinessplan
                  size={24}
                  color={previousYearProjectInvoiced === 0 ? "white" : "black"}
                />
              }
              color={previousYearProjectInvoiced === 0 ? "gray" : "yellow"}
            />
            <p>{localeCurrencyString(previousYearInvoiceAmount)}</p>
          </div>
          <div className="customerItemTitle">
            <CustomerItem
              value={[`Facturation ${new Date().getFullYear()} :`]}
              icon={
                <IconBusinessplan
                  size={24}
                  color={currentProjectInvoiced === 0 ? "white" : "black"}
                />
              }
              color={
                currentProjectInvoiced === 0
                  ? "gray"
                  : (currentInvoiceAmount / previousYearInvoiceAmount) * 100 <
                    80
                  ? "red"
                  : (currentInvoiceAmount / previousYearInvoiceAmount) * 100 >=
                      80 &&
                    (currentInvoiceAmount / previousYearInvoiceAmount) * 100 <
                      100
                  ? "orange"
                  : "green"
              }
            />
            <p
              style={{
                fontWeight: "bold",
                color:
                  currentProjectInvoiced === 0
                    ? "gray"
                    : (currentInvoiceAmount / previousYearInvoiceAmount) * 100 <
                      80
                    ? theme.colors.red[6]
                    : (currentInvoiceAmount / previousYearInvoiceAmount) *
                        100 >=
                        80 &&
                      (currentInvoiceAmount / previousYearInvoiceAmount) * 100 <
                        100
                    ? theme.colors.orange[6]
                    : theme.colors.green[6],
              }}
            >
              {localeCurrencyString(currentInvoiceAmount)}
            </p>
          </div>

          <div className="customerItemTitle">
            <CustomerItem
              inputType={"number"}
              value={[`Moyenne ${new Date().getFullYear() - 1} :`]}
              icon={
                <IconCalculator
                  size={24}
                  color={previousYearProjectInvoiced === 0 ? "white" : "black"}
                />
              }
              color={previousYearProjectInvoiced === 0 ? "gray" : "yellow"}
            />
            <p>
              {localeCurrencyString(
                previousYearInvoiceAmount / previousYearProjectInvoiced
              )}
            </p>
          </div>
          <div className="customerItemTitle">
            <CustomerItem
              inputType={"number"}
              value={[`Moyenne ${new Date().getFullYear()} :`]}
              icon={
                <IconCalculator
                  size={24}
                  color={currentProjectInvoiced === 0 ? "white" : "black"}
                />
              }
              color={
                currentProjectInvoiced === 0
                  ? "gray"
                  : (currentInvoiceAmount /
                      currentProjectInvoiced /
                      (previousYearInvoiceAmount /
                        previousYearProjectInvoiced)) *
                      100 <
                    80
                  ? "red"
                  : (currentInvoiceAmount /
                      currentProjectInvoiced /
                      (previousYearInvoiceAmount /
                        previousYearProjectInvoiced)) *
                      100 >=
                      80 &&
                    (currentInvoiceAmount /
                      currentProjectInvoiced /
                      (previousYearInvoiceAmount /
                        previousYearProjectInvoiced)) *
                      100 <
                      100
                  ? "orange"
                  : "green"
              }
            />
            <p
              style={{
                fontWeight: "bold",
                color:
                  currentProjectInvoiced === 0
                    ? "gray"
                    : (currentInvoiceAmount /
                        currentProjectInvoiced /
                        (previousYearInvoiceAmount /
                          previousYearProjectInvoiced)) *
                        100 <
                      80
                    ? theme.colors.red[6]
                    : (currentInvoiceAmount /
                        currentProjectInvoiced /
                        (previousYearInvoiceAmount /
                          previousYearProjectInvoiced)) *
                        100 >=
                        80 &&
                      (currentInvoiceAmount /
                        currentProjectInvoiced /
                        (previousYearInvoiceAmount /
                          previousYearProjectInvoiced)) *
                        100 <
                        100
                    ? theme.colors.orange[6]
                    : theme.colors.green[6],
              }}
            >
              {localeCurrencyString(
                currentInvoiceAmount / currentProjectInvoiced
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CustomerPayment;
