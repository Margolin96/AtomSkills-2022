<div>
        <label for="name" class="block text-900 font-medium mt-3 mb-2">Имя *</label>
        <InputText
          id="name"
          class="w-full"
          :class="{ 'p-invalid': touched && validation.name }"
          v-model="user.name"
        />
        <small v-if="touched && validation.name" class="p-error">Обязательное поле</small>

        <label for="surname" class="block text-900 font-medium mt-3 mb-2">Фамилия *</label>
        <InputText
          id="surname"
          class="w-full"
          :class="{ 'p-invalid': touched && validation.surname }"
          v-model="user.surname"
        />
        <small v-if="touched && validation.surname" class="p-error">Обязательное поле</small>

        <label for="patronymic" class="block text-900 font-medium mt-3 mb-2">Отчество</label>
        <InputText id="patronymic" type="text" class="w-full" v-model="user.patronymic" />

        <template v-if="!needAdmin">
          <label for="role" class="block text-900 font-medium mt-3 mb-2">Роль *</label>
          <Dropdown
            id="role"
            :options="roles"
            optionValue="id"
            optionLabel="caption_role"
            class="w-full"
            :class="{ 'p-invalid': touched && validation.role }"
            v-model="user.role"
          />
          <small v-if="touched && validation.role" class="p-error">Обязательное поле</small>
        </template>

        <label for="password" class="block text-900 font-medium mt-3 mb-2">Пароль *</label>
        <InputText
          id="password"
          type="password"
          class="w-full"
          :class="{ 'p-invalid': touched && validation.password }"
          v-model="user.password"
        />
        <small v-if="touched && validation.password" class="p-error">Обязательное поле</small>
      </div>