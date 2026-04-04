package com.monparcimmo.service;

import com.google.cloud.firestore.*;
import com.monparcimmo.model.Expense;
import com.monparcimmo.model.Reservation;
import com.monparcimmo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserService userService;

    public Map<String, Object> getYearlyStatistics(int year) {
        List<Reservation> allReservations = reservationService.getAllReservations();

        List<Reservation> yearReservations = allReservations.stream()
                .filter(r -> r.getCheckInDate() != null
                        && r.getCheckInDate().getYear() == year
                        && !"CANCELLED".equals(r.getStatus()))
                .collect(Collectors.toList());

        double totalRevenue = yearReservations.stream()
                .mapToDouble(Reservation::getTotalPrice)
                .sum();

        long totalNights = yearReservations.stream()
                .mapToLong(r -> ChronoUnit.DAYS.between(r.getCheckInDate(), r.getCheckOutDate()))
                .sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("year", year);
        stats.put("totalReservations", yearReservations.size());
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalNights", totalNights);
        stats.put("averageStayDuration", yearReservations.isEmpty() ? 0 : (double) totalNights / yearReservations.size());
        stats.put("currency", "EUR");

        return stats;
    }

    public Map<String, Object> getBookingsPerMonth(int year) {
        List<Reservation> allReservations = reservationService.getAllReservations();
        int[] bookingsPerMonth = new int[12];
        double[] revenuePerMonth = new double[12];

        allReservations.stream()
                .filter(r -> r.getCheckInDate() != null
                        && r.getCheckInDate().getYear() == year
                        && !"CANCELLED".equals(r.getStatus()))
                .forEach(r -> {
                    int month = r.getCheckInDate().getMonthValue() - 1;
                    bookingsPerMonth[month]++;
                    revenuePerMonth[month] += r.getTotalPrice();
                });

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("bookingsPerMonth", bookingsPerMonth);
        result.put("revenuePerMonth", revenuePerMonth);
        result.put("months", new String[]{"Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
                "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"});

        return result;
    }

    public Map<String, Object> getFinancialSummary(int year) {
        Map<String, Object> yearlyStats = getYearlyStatistics(year);
        double totalRevenue = (double) yearlyStats.get("totalRevenue");

        List<Expense> expenses = expenseService.getExpensesByYear(year);
        double totalExpenses = expenses.stream().mapToDouble(Expense::getAmount).sum();

        // Dépenses par catégorie
        Map<String, Double> expensesByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategory,
                        Collectors.summingDouble(Expense::getAmount)
                ));

        Map<String, Object> summary = new HashMap<>();
        summary.put("year", year);
        summary.put("totalRevenue", totalRevenue);
        summary.put("totalExpenses", totalExpenses);
        summary.put("netIncome", totalRevenue - totalExpenses);
        summary.put("expensesByCategory", expensesByCategory);
        summary.put("currency", "EUR");

        return summary;
    }

    public Map<String, Object> getClientsWithHistory() {
        List<User> clients = userService.getAllUsers();
        List<Reservation> allReservations = reservationService.getAllReservations();

        List<Map<String, Object>> clientsWithHistory = clients.stream().map(client -> {
            List<Reservation> clientReservations = allReservations.stream()
                    .filter(r -> r.getClientUid().equals(client.getUid()))
                    .sorted(Comparator.comparing(Reservation::getCheckInDate,
                            Comparator.nullsLast(Comparator.reverseOrder())))
                    .collect(Collectors.toList());

            double totalSpent = clientReservations.stream()
                    .filter(r -> !"CANCELLED".equals(r.getStatus()))
                    .mapToDouble(Reservation::getTotalPrice)
                    .sum();

            Map<String, Object> clientData = new HashMap<>();
            clientData.put("client", client);
            clientData.put("reservations", clientReservations);
            clientData.put("totalReservations", clientReservations.size());
            clientData.put("totalSpent", totalSpent);
            return clientData;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("clients", clientsWithHistory);
        result.put("totalClients", clients.size());

        return result;
    }

    public Map<String, Object> getOccupancyRate(int year) {
        int totalDaysInYear = 365;
        List<Reservation> reservations = reservationService.getAllReservations().stream()
                .filter(r -> r.getCheckInDate() != null
                        && r.getCheckInDate().getYear() == year
                        && "CONFIRMED".equals(r.getStatus()))
                .collect(Collectors.toList());

        long occupiedDays = reservations.stream()
                .mapToLong(r -> ChronoUnit.DAYS.between(r.getCheckInDate(), r.getCheckOutDate()))
                .sum();

        Map<String, Object> result = new HashMap<>();
        result.put("year", year);
        result.put("occupiedDays", occupiedDays);
        result.put("totalDays", totalDaysInYear);
        result.put("occupancyRate", (double) occupiedDays / totalDaysInYear * 100);

        return result;
    }
}
