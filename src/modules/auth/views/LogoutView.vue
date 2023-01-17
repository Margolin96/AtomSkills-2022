<template>
  Выход
</template>

<script setup>

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import UserService from '@/api/UserService';

const userService = ref(new UserService());

const router = useRouter();

userService.value.Logout().then(router.push({ name: 'login' }));

</script>
