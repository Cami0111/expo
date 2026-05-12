import { Ionicons } from '@expo/vector-icons'; // Viene con Expo
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function HomeTocs() {
    return (
        <View style={styles.container}>
            {/* Configuración del Header */}
            <Stack.Screen
                options={{
                    title: "Dashboard",
                    headerRight: () => (
                        <TouchableOpacity onPress={() => alert('Perfil')}>
                            <Ionicons name="person-circle-outline" size={28} color="#007AFF" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Sección de Bienvenida */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.title}>¡Hola, Maria Camila! 👋</Text>
                    <Text style={styles.subtitle}>wa</Text>
                </View>

                { }
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#8E8E93" />
                    <TextInput
                        placeholder="Buscar proyectos..."
                        style={styles.searchInput}
                        placeholderTextColor="#8E8E93"
                    />
                </View>

                {/* Tarjeta de Proyecto (Estilo Stave) */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Stave API Status</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Activo</Text>
                        </View>
                    </View>
                    <Text style={styles.cardBody}>
                        El prototipo de la REST API con NestJS está respondiendo correctamente en el puerto 3000.
                    </Text>
                    <TouchableOpacity style={styles.mainButton}>
                        <Text style={styles.mainButtonText}>Ver Logs</Text>
                    </TouchableOpacity>
                </View>

                {/* Otra sección: Ecocampus */}
                <TouchableOpacity style={styles.secondaryCard}>
                    <Ionicons name="leaf-outline" size={24} color="#34C759" />
                    <View style={{ marginLeft: 12 }}>
                        <Text style={styles.secondaryTitle}>Ecocampus Javeriana</Text>
                        <Text style={styles.secondarySub}>Puntos de disposición técnica</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        padding: 20,
    },
    welcomeSection: {
        marginBottom: 25,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E9E9EB',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 25,
    },
    searchInput: {
        marginLeft: 10,
        fontSize: 16,
        flex: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    badge: {
        backgroundColor: '#E1F5FE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#0288D1',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardBody: {
        color: '#636366',
        lineHeight: 20,
        marginBottom: 20,
    },
    mainButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    mainButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    secondaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    secondaryTitle: {
        fontWeight: '600',
        fontSize: 16,
    },
    secondarySub: {
        color: '#8E8E93',
        fontSize: 14,
    },
});