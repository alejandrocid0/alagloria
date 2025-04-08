
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFormContext } from 'react-hook-form';
import { LevelFormValues, availableIcons } from '../schema/levelFormSchema';

interface FormFieldsProps {
  isEditing?: boolean;
}

const FormFields = ({ isEditing = false }: FormFieldsProps) => {
  const form = useFormContext<LevelFormValues>();

  return (
    <>
      {/* Campo de nombre */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Nombre del nivel" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Campo de descripción */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Descripción del nivel" rows={3} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Selección de icono */}
      <FormField
        control={form.control}
        name="icon_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Icono</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un icono" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableIcons.map((icon) => (
                  <SelectItem key={icon} value={icon}>
                    {icon.charAt(0).toUpperCase() + icon.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Campo de respuestas requeridas */}
        <FormField
          control={form.control}
          name="required_correct_answers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Respuestas correctas requeridas</FormLabel>
              <FormControl>
                <Input type="number" {...field} min="0" placeholder="0" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de orden */}
        <FormField
          control={form.control}
          name="level_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden de nivel</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  min="1"
                  placeholder="1"
                  disabled={isEditing} // Deshabilitar si estamos editando
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Selección de categoría */}
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoría</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="cofrade">Cofrade</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default FormFields;
